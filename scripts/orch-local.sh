#!/usr/bin/env bash
# Local orchestrated run: one `orchestrate discover` pre-step mints a shared
# orchestration id, then N machines connect over WebSocket and the service PUSHES
# spec batches to them until the queue drains. All batches merge into ONE
# test_runs row, with each test attributed to the machine that ran it.
#
#   npm run test:orch             2 machines, chromium+firefox (multi-project)
#   npm run test:orch:api         3 machines, api project (network-free, wider)
#   ORCH_MACHINES=4 npm run test:orch
#
# Unlike split mode, the machine does NOT decide what it runs — it waits on the
# socket and the dispatcher assigns. Legs therefore MUST run in parallel: started
# one at a time, the first machine drains the whole queue and the rest connect to
# a drained orchestration and exit immediately on `end`.
#
# serverUrl/token resolve from playwright.config.js (localhost:3005 when CI is
# unset). Requires the local stack WITH the orchestrator enabled:
#   make infra-up
#   services/{data-handler/go,ingestion/go}/.env  -> *_ENABLED=true
#   make data-handler-docker-redeploy && make ingestion-docker-redeploy
#   docker exec redpanda rpk topic create testdino-orchestration-control
set -euo pipefail

cd "$(dirname "$0")/.."

MODE="${ORCH_MODE:-browser}"
MACHINES="${ORCH_MACHINES:-}"
OUT="${ORCH_OUT:-.orch-master.json}"

# `discover` filters by --project/--grep only (it lists the whole testDir), so the
# spec set is chosen by filter, never by path.
case "$MODE" in
  browser)
    # multi-browser.spec.js carries all five browser tags, so ONE file yields TWO
    # (file, project) dispatch units. That pair is the multi-project regression
    # (TDV2-831): before the fix the queue keyed on file alone, the two collapsed
    # into one unit, and Firefox was discovered but never executed — green run,
    # half the coverage missing. The --grep also proves grep propagation: the
    # dispatcher echoes it on every assign frame so a batch runs only the
    # discovered tests rather than the whole file.
    PROJECTS=(chromium firefox)
    GREP="Multi Browser"
    : "${MACHINES:=2}"
    ;;
  api)
    # Five api specs, no browser. split-statuses.spec.js alone carries 80 cases in
    # four terminal statuses and is network-free, so the whole group finishes in
    # about a minute while still running long enough to watch the live view.
    PROJECTS=(api)
    GREP=""
    : "${MACHINES:=3}"
    ;;
  *)
    echo "ORCH_MODE must be 'browser' or 'api' (got '$MODE')" >&2
    exit 2
    ;;
esac

echo "=== discover (single pre-step) ==="
npx tdpw orchestrate discover \
  --machines "$MACHINES" \
  --project "${PROJECTS[@]}" \
  ${GREP:+--grep "$GREP"} \
  --out "$OUT"

ORCH_ID=$(node -e "process.stdout.write(require('./$OUT').orchestrationId)")
SPEC_COUNT=$(node -e "process.stdout.write(String(require('./$OUT').specCount))")

if [ "$SPEC_COUNT" = "0" ]; then
  echo "discover matched 0 specs — the filters exclude everything, nothing to run" >&2
  exit 1
fi

echo
echo "orchestration: $ORCH_ID   specs: $SPEC_COUNT   machines: $MACHINES"
echo

# Every leg in parallel, mirroring a CI matrix. A leg that exits non-zero is not
# an error here: the suite contains deliberately failing specs.
pids=()
for i in $(seq 1 "$MACHINES"); do
  (
    npx tdpw orchestrate run \
      --orchestration-id "$ORCH_ID" \
      --device-id "m$i" \
      2>&1 | sed "s/^/[m$i] /"
  ) &
  pids+=("$!")
done

for pid in "${pids[@]}"; do
  wait "$pid" || true
done

echo
echo "=== all machines closed on the end signal ==="
echo
echo "NOTE: a leg exits 0 whenever the hub sends 'end', even if its tests failed"
echo "      (ORCH-F2, tracked on the CLI). Read the run status below, not \$?."
echo

PSQL="docker exec ingestion-timescaledb psql -U postgres -d ingestion_dev"

cat <<EOF
Verify the ONE merged run row (status 'incomplete' means a spec could not execute):

  $PSQL -c \\
    "SELECT id, status, total_tests, could_not_execute_specs
       FROM test_runs WHERE orchestration_id = '$ORCH_ID';"

Per-machine attribution — the whole point of device_id. Every machine that ran
anything must appear, and the totals must sum to the run's case count:

  $PSQL -c \\
    "SELECT device_id, count(*) FROM test_cases
      WHERE run_id = (SELECT id FROM test_runs WHERE orchestration_id = '$ORCH_ID')
      GROUP BY 1 ORDER BY 1;"
EOF

if [ "$MODE" = "browser" ]; then
  cat <<EOF

Multi-project proof (TDV2-831) — BOTH browsers must appear with equal counts. One
row, or one row at double the count, is the bug this mode exists to catch. There
is no project column on test_cases; the project is title_path[1] (ingestion stores
Playwright's raw titlePath: ["", project, file, ...describe, title]):

  $PSQL -c \\
    "SELECT title_path->>1 AS project, count(*) FROM test_cases
      WHERE run_id = (SELECT id FROM test_runs WHERE orchestration_id = '$ORCH_ID')
      GROUP BY 1 ORDER BY 1;"
EOF
fi

cat <<EOF

Redis keyspace after drain (grace-expired to ~120s, not the 24h run TTL):

  docker exec data-handler-redis redis-cli --scan --pattern 'orchestrate:push:*:$ORCH_ID'
EOF
