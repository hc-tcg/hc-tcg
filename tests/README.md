Hermitcraft TCG uses four types of tests:
	- Unit Tests 
	- Snapshot Tests
	- End To End Tests
	- Shell Script Tests

## Unit Tests
Unit tests are used for redux saga and various functions and components.
Unit tests are done using `jest`

## Snapshot Tests
These tests are used to ensure the output of a function does not unexpectedly drift.
We use snapshot tests primarily to test the frontend. Snapshot tests are done using `jest`.

## End To End Tests
End To End (e2e) Tests are used to verify the client behaves correctly.
Playwright is used to implement e2e tests.

## Shell Tests
Shell scripts are used to test the hc-tcg API. `curl` and `jq` must be installed to run these tests.


