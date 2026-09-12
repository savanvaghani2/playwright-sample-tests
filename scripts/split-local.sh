#!/usr/bin/env bash
# Local equivalent of .github/workflows/testdino-split-staging.yml: one logical
# split run made of 3 splits, where split 2 is itself sharded across 2 legs.
# Exercises the unsharded-split, sharded-split, and split-shard drill-down paths.
#
#   npm run test:split            clean group (no overlap)
#   npm run test:split:overlap    split 3 re-runs split 1's spec -> overlapping
#                                 pw_test_ids, so ingestion raises
#                                 split_anomaly_count and the run detail renders
#                                 the "counts unreliable" banner
#
# serverUrl/token resolve from playwright.config.js (localhost:3005 when CI is
# unset). Requires the local stack: make infra-up + ingestion + data-handler.
set -euo pipefail

cd "$(dirname "$0")/.."

SPLIT_ID="${SPLIT_ID:-local-$(date +%s)}"
OVERLAP="${SPLIT_OVERLAP:-0}"

# Status coverage: split-statuses.spec.js carries 20 cases in each terminal status
# (passed/failed/flaky/skipped) and is network-free, so the whole group finishes
# inside a minute while still running long enough to watch live. The demo-store
# specs are too slow to hit that budget at this case count.
# Split 2 (the sharded one) carries the status spec: 80 cases across 2 shards is
# the case the per-shard live accordion exists for.
SPLIT2_SPECS="tests/split-statuses.spec.js"

# Split 3 duplicates split 1's spec in overlap mode: the same pw_test_ids arrive
# under two split indexes, which is exactly the anomaly the backend flags.
SPLIT3_SPECS="tests/get-users.spec.js tests/delete-api.spec.js tests/updateUser.spec.js"
if [ "$OVERLAP" = "1" ]; then
  SPLIT3_SPECS="tests/split-statuses.spec.js"
fi

echo "split-id: $SPLIT_ID  (overlap=$OVERLAP)"

# Legs run sequentially: 4 concurrent browser logins overwhelm the demo site and
# a timed-out globalSetup would leave that leg reporting 0 tests.
run_leg() {
  local name="$1" split="$2" ci="$3" shard="$4" project="$5"
  shift 5
  echo "=== $name ==="
  # shellcheck disable=SC2086
  npx tdpw test \
    --split "$split" \
    --split-id "$SPLIT_ID" \
    --ci-run-id "$SPLIT_ID-$ci" \
    ${shard:+--shard=$shard} \
    --project="$project" \
    "$@" || echo "(leg '$name' exited non-zero — expected when a spec has failing tests)"
}

# Seconds to pause between legs. A real CI matrix staggers its jobs; locally the
# legs finish in seconds, which makes the "split 1 done, split 2 running, split 3
# waiting" live state too brief to see. Well under SPLIT_GROUP_IDLE_S (600s).
LEG_DELAY="${SPLIT_LEG_DELAY:-0}"
pause() { [ "$LEG_DELAY" != "0" ] && sleep "$LEG_DELAY"; return 0; }

# SPLIT_PARALLEL=1 launches every leg at once, matching a real CI matrix where
# splits run concurrently rather than one after another.
if [ "${SPLIT_PARALLEL:-0}" = "1" ]; then
  run_leg "split 1/3 (unsharded)" 1/3 1 ""    api tests/post-api.spec.js &
  run_leg "split 2/3 shard 1/2"   2/3 2 "1/2" api $SPLIT2_SPECS &
  run_leg "split 2/3 shard 2/2"   2/3 2 "2/2" api $SPLIT2_SPECS &
  run_leg "split 3/3 (unsharded)" 3/3 3 ""    api $SPLIT3_SPECS &
  wait
else
  run_leg "split 1/3 (unsharded)" 1/3 1 ""    api tests/post-api.spec.js
  pause
  run_leg "split 2/3 shard 1/2"   2/3 2 "1/2" api $SPLIT2_SPECS
  pause
  run_leg "split 2/3 shard 2/2"   2/3 2 "2/2" api $SPLIT2_SPECS
  pause
  run_leg "split 3/3 (unsharded)" 3/3 3 ""    api $SPLIT3_SPECS
fi

cat <<EOF

Done. Verify the merged row:

  docker exec ingestion-timescaledb psql -U postgres -d ingestion_dev -c \\
    "SELECT id, total_splits, split_anomaly_count, split_shard_totals, split_completion
       FROM test_runs WHERE split_id = '$SPLIT_ID';"

  docker exec ingestion-timescaledb psql -U postgres -d ingestion_dev -c \\
    "SELECT split_index, shard_index, count(*) FROM test_cases
      WHERE run_id = (SELECT id FROM test_runs WHERE split_id = '$SPLIT_ID')
      GROUP BY 1,2 ORDER BY 1,2;"
EOF
