#!/usr/bin/env bash
set -euo pipefail

skip_tests=0
forward_args=()

for arg in "$@"; do
	if [[ "$arg" == "--skip-tests" ]]; then
		skip_tests=1
		continue
	fi
	forward_args+=("$arg")
done

if (( skip_tests )); then
	SKIP_TESTS=1 git commit "${forward_args[@]}"
else
	git commit "${forward_args[@]}"
fi
