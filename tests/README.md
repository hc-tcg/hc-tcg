## Test Information

Hermitcraft TCG uses four types of tests:

- Unit Tests: `npm run test:unit`
- Snapshot Tests: `npm run test:snapshot`
- End To End Tests: `npm run test:e2e`
- Shell Script Tests: `npm run test:api`

### Unit Tests
Unit tests are used for redux saga and various functions and components.
Unit tests are done using `jest`

### Snapshot Tests
These tests are used to ensure the output of a function does not unexpectedly drift.
We use snapshot tests primarily to test the frontend. Snapshot tests are done using `jest`.

### End To End Tests
End To End (e2e) Tests are used to verify the client behaves correctly.
Playwright is used to implement e2e tests.

Special query parameters are made available when running in debug mode to be used in e2e tests.

| Query Param | Description |
| ----------- | ----------- |
| showUpdateModal | If `false`, do not show the update modal on login |

Additionally debug mode endpoints are enabled.

| Endpoint | Description |
| ---      | ----        |
| GET `/debug/root-state/queue` | Returns the players that are in the public queue |

### Shell Tests
Shell scripts are used to test the hc-tcg API. `curl` and `jq` must be installed to run these tests.


