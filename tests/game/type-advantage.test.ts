import {describe, expect, test} from '@jest/globals'
import PoultrymanCommon from 'common/cards/alter-egos/hermits/poultryman-common'
import XBCraftedCommon from 'common/cards/default/hermits/xbcrafted-common'
import { attack, endTurn, playCardFromHand, testGame } from './utils'
import { RowComponent } from 'common/components'
import query from 'common/components/query'
import { Hermit } from 'common/cards/base/types'
import MumboJumboCommon from 'common/cards/default/hermits/mumbojumbo-common'
import HotguyCommon from 'common/cards/alter-egos-iii/hermits/hotguy-common'
import ImpulseSVCommon from 'common/cards/default/hermits/impulsesv-common'
import IJevinCommon from 'common/cards/default/hermits/ijevin-common'
import GrianCommon from 'common/cards/default/hermits/grian-common'
import GoodTimesWithScarCommon from 'common/cards/default/hermits/goodtimeswithscar-common'
import TinFoilChefCommon from 'common/cards/default/hermits/tinfoilchef-common'

describe("Type advantage tests", () => {
    test('Prankster v PvP', getTestGame(PoultrymanCommon, XBCraftedCommon))
    test('Redstoner v PvP', getTestGame(MumboJumboCommon, XBCraftedCommon))
    test('PvP v Speedrunner', getTestGame(XBCraftedCommon, HotguyCommon))
    test('PvP v Farm', getTestGame(XBCraftedCommon, ImpulseSVCommon))
    test('Farm v Explorer', getTestGame(ImpulseSVCommon, IJevinCommon))
    test('Explorer v Builder', getTestGame(IJevinCommon, GrianCommon))
    test('Builder v Terraformer', getTestGame(GrianCommon, GoodTimesWithScarCommon))
    test('Terraformer v Redstoner', getTestGame(GoodTimesWithScarCommon, MumboJumboCommon))
    test('Miner v Redstoner', getTestGame(TinFoilChefCommon, MumboJumboCommon))
    test('Miner v Prankster', getTestGame(TinFoilChefCommon, PoultrymanCommon))
    test('Speedrunner v Miner', getTestGame(HotguyCommon, TinFoilChefCommon))
    test('Speedrunner v Prankster', getTestGame(HotguyCommon, PoultrymanCommon))
    test('Prankster v Builder', getTestGame(PoultrymanCommon, GrianCommon))

    function getTestGame(attacker: Hermit, defender: Hermit) {
        return () => {
            testGame(
                {
                    playerOneDeck: [defender],
                    playerTwoDeck: [attacker],
                    saga: function* (game) {
                        yield* playCardFromHand(game, defender, 'hermit', 0)
                        yield* endTurn(game)
    
                        yield* playCardFromHand(game, attacker, 'hermit', 0)
                        yield* attack(game, 'primary')
                        yield* endTurn(game)
    
                        expect(
                            game.components.find(
                                RowComponent,
                                query.row.currentPlayer,
                                query.row.index(0)
                            )?.health,
                        ).toBe(defender.health - (attacker.primary.damage + 20))
                    }
                },
                {startWithAllCards: true, noItemRequirements: true}
            )
        }
    }
})