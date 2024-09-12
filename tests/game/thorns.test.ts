import {describe, expect, test} from "@jest/globals"
import { attack, endTurn, playCardFromHand, testGame } from "./utils"
import EthosLabCommon from "common/cards/default/hermits/ethoslab-common"
import Thorns from "common/cards/default/effects/thorns"
import IronSword from "common/cards/default/single-use/iron-sword"
import { RowComponent } from "common/components"
import query from "common/components/query"

describe("Test Thorns", () => {
    test("Test thorns damage after attacks with effect card only", () => {
        testGame(
            {
                playerOneDeck: [EthosLabCommon, Thorns],
                playerTwoDeck: [EthosLabCommon, IronSword],
                saga: function* (game) {
                    yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
                    yield* playCardFromHand(game, Thorns, 'attach', 0)
                    yield* endTurn(game)

                    yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
                    yield* playCardFromHand(game, IronSword, 'single_use')
                    yield* attack(game, 'single-use')

                    expect(game.components.find(
                        RowComponent,
                        query.row.currentPlayer,
                        query.row.index(0)
                    )?.health).toBe(EthosLabCommon.health - 20 /*Thorns damage*/)

                    expect(game.components.find(
                        RowComponent,
                        query.row.opponentPlayer,
                        query.row.index(0)
                    )?.health).toBe(EthosLabCommon.health - 20 /*Iron sword damage*/)
                }
            },
            {startWithAllCards: true, noItemRequirements: true}
        )
    })
})