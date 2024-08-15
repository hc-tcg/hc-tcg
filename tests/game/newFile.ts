import { describe, test } from "@jest/globals";
import { testGame } from "./utils";

describe('Test Clock', () => {
    test('Test Clock', () => {
        testGame(
            {
                saga: testClockHelperSaga,
                playerOneDeck: [EthosLabCommon],
                playerTwoDeck: [EthosLabCommon, Clock],
            },
            { startWithAllCards: true }
        );
    });
});
