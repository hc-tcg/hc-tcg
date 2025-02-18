## Test Information

Hermitcraft TCG uses four types of tests:

- Unit Tests: `npm run test:unit`
- Starer Deck Tests: `npm run test:starter-decks`
- Database Tests: `npm run test:db`
- Component Tests: `npm run test:ct`
- End To End Tests: `npm run test:e2e`
- Shell Script Tests: `npm run test:api`
- Fuzz Testing: `npm run test:fuzz`

### Unit Tests
Unit tests are used for redux saga and various functions and components.
Unit tests are done using `jest`

### Component Tests
These tests are used to ensure that a function renders as expected. This is done
using `playwright`'s experimental component tests. Snapshots for component tests
can be updated with `npm run test:ct-update`.

### End To End Tests
End To End (e2e) Tests are used to verify the client behaves correctly.
Playwright is used to implement e2e tests.

Special query parameters are made available when running in debug mode to be used in e2e tests.

| Query Param | Description |
| ----------- | ----------- |
| showUpdatesModal | If `false`, do not show the update modal on login |

Additionally debug mode endpoints are enabled.

| Endpoint | Description |
| ---      | ----        |
| GET `/debug/root-state/queue` | Returns the players that are in the public queue |

### Shell Tests
Shell scripts are used to test the hc-tcg API. `curl` and `jq` must be installed to run these tests.

### Fuzz Tests
Commands:
- Run many tests: `npm run test:fuzz -- fuzz <number of times>`
- Run a test with a specific seed and debug logs: `npm run test:fuzz -- debug <the seed>`

Fuzz tests run random AI players against each other to attempt to find bugs.
This type of test focuses on two specific bug categories:
- Assertion failures
- The game getting in a "stuck" state. For example a pick request having no pickable slots.

Other Flags:
| Flag | Description |
| ---      | ----        |
| `--fail-fast` | Fail after the first error is found. |
| `--json` | Print the output in JSON. |

