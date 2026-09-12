#!/usr/bin/env bash
# Every execution shape TestDino has to render, one logical run each, against the
# local stack. Covers the two independent dimensions (sharded? splitted?) crossed
# with worker count, because the live view derives its worker rows from run:begin's
# `workers` and its sections from (splitIndex, shardIndex).
#
#   npm run test:matrix              all 8 shapes, sequential
#   MATRIX_ONLY=5,6 npm run test:matrix   just those cases
#
# Each case is its own run (own ciRunId); split cases share one splitId across
# their legs so they merge. Requires the local stack: make infra-up + ingestion +
# data-handler.
set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="${MATRIX_STAMP:-m$(date +%s)}"
ONLY="${MATRIX_ONLY:-}"
SPEC="${MATRIX_SPEC:-tests/split-statuses.spec.js}"

# The matrix proves TOPOLOGY (shard x split x workers), not status volume, so it
# runs a small fast slice — 3 cases per status with a short hold. test:split keeps
# the full 20-per-status set.
export SPLIT_CASES="${MATRIX_CASES:-3}"
export SPLIT_STEP_MS="${MATRIX_STEP_MS:-120}"

wants() {
  [ -z "$ONLY" ] && return 0
  case ",$ONLY," in *,"$1",*) return 0 ;; *) return 1 ;; esac
}

# Args: label, ciRunId suffix, then any extra tdpw flags.
leg() {
  local label="$1" ci="$2"
  shift 2
  echo "--- $label"
  # shellcheck disable=SC2086
  npx tdpw test --project=api --ci-run-id "$STAMP-$ci" "$@" $SPEC \
    || echo "  (non-zero exit — expected, the spec carries failing cases)"
}

echo "matrix stamp: $STAMP"

# 1-2: plain run (no shard, no split), many vs one worker.
wants 1 && leg "1 plain, workers=5" plain-w5 --workers=5
wants 2 && leg "2 plain, workers=1" plain-w1 --workers=1

# 3-4: sharded only.
if wants 3; then
  leg "3 sharded 1/2, workers=5" sh-w5 --workers=5 --shard=1/2
  leg "3 sharded 2/2, workers=5" sh-w5 --workers=5 --shard=2/2
fi
if wants 4; then
  leg "4 sharded 1/2, workers=1" sh-w1 --workers=1 --shard=1/2
  leg "4 sharded 2/2, workers=1" sh-w1 --workers=1 --shard=2/2
fi

# A manual split hand-partitions the suite, so each leg must run a DISJOINT slice.
# Running the same specs in two splits is the overlap anomaly (case 9), not a
# clean split — the duplicate pw_test_ids dedup into one case row and one split's
# counts get absorbed.
SLICE_1='Split Passed|Split Failed'
SLICE_2='Split Flaky|Split Skipped'

# 5-6: splitted, no shards. Splits must NOT reuse a ciRunId (that is the shard key).
if wants 5; then
  leg "5 split 1/2 unsharded, workers=5" sp-w5-1 --workers=5 --grep "$SLICE_1" \
    --split 1/2 --split-id "$STAMP-sp-w5"
  leg "5 split 2/2 unsharded, workers=5" sp-w5-2 --workers=5 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-sp-w5"
fi
if wants 6; then
  leg "6 split 1/2 unsharded, workers=1" sp-w1-1 --workers=1 --grep "$SLICE_1" \
    --split 1/2 --split-id "$STAMP-sp-w1"
  leg "6 split 2/2 unsharded, workers=1" sp-w1-2 --workers=1 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-sp-w1"
fi

# 7-8: splitted AND sharded — split 2 is itself sharded, split 1 is not, so one
# group carries both nesting shapes at once.
if wants 7; then
  leg "7 split 1/2 unsharded, workers=5" ss-w5-1 --workers=5 --grep "$SLICE_1" \
    --split 1/2 --split-id "$STAMP-ss-w5"
  leg "7 split 2/2 shard 1/2, workers=5" ss-w5-2 --workers=5 --shard=1/2 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-ss-w5"
  leg "7 split 2/2 shard 2/2, workers=5" ss-w5-2 --workers=5 --shard=2/2 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-ss-w5"
fi
if wants 8; then
  leg "8 split 1/2 unsharded, workers=1" ss-w1-1 --workers=1 --grep "$SLICE_1" \
    --split 1/2 --split-id "$STAMP-ss-w1"
  leg "8 split 2/2 shard 1/2, workers=1" ss-w1-2 --workers=1 --shard=1/2 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-ss-w1"
  leg "8 split 2/2 shard 2/2, workers=1" ss-w1-2 --workers=1 --shard=2/2 --grep "$SLICE_2" \
    --split 2/2 --split-id "$STAMP-ss-w1"
fi

# 9: deliberate overlap — both splits claim the SAME slice, so ingestion must raise
# split_anomaly_count and the UI must mark the counts unreliable.
if wants 9; then
  for s in 1 2; do
    leg "9 split $s/2 OVERLAPPING, workers=5" ov-$s --workers=5 --grep "$SLICE_1" \
      --split "$s/2" --split-id "$STAMP-ov"
  done
fi

cat <<EOF

Done. Verify every shape landed as its own correctly-typed run:

  docker exec ingestion-timescaledb psql -U postgres -d ingestion_dev -c \\
    "SELECT ci_run_id, split_id, total_shards, total_splits, total_tests,
            passed, failed, flaky, skipped, status
       FROM test_runs WHERE ci_run_id LIKE '$STAMP%' OR split_id LIKE '$STAMP%'
      ORDER BY start_time;"
EOF
