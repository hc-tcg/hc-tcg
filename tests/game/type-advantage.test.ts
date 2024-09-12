import {describe, expect, test} from '@jest/globals'
import HotguyCommon from 'common/cards/alter-egos-iii/hermits/hotguy-common'
import PoultrymanCommon from 'common/cards/alter-egos/hermits/poultryman-common'
import {Hermit} from 'common/cards/base/types'
import GoodTimesWithScarCommon from 'common/cards/default/hermits/goodtimeswithscar-common'
import GrianCommon from 'common/cards/default/hermits/grian-common'
import IJevinCommon from 'common/cards/default/hermits/ijevin-common'
import ImpulseSVCommon from 'common/cards/default/hermits/impulsesv-common'
import MumboJumboCommon from 'common/cards/default/hermits/mumbojumbo-common'
import TinFoilChefCommon from 'common/cards/default/hermits/tinfoilchef-common'
import XBCraftedCommon from 'common/cards/default/hermits/xbcrafted-common'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

var typeToHermitMap: Map<String, Hermit> = new Map([
	['Prankster', PoultrymanCommon],
	['PvP', XBCraftedCommon],
	['Redstoner', MumboJumboCommon],
	['Speedrunner', HotguyCommon],
	['Farm', ImpulseSVCommon],
	['Explorer', IJevinCommon],
	['Builder', GrianCommon],
	['Terraformer', GoodTimesWithScarCommon],
	['Miner', TinFoilChefCommon],
])

function createTypeAdvantageTest(attackingType: String, defendingType: String) {
	test(attackingType + ' v ' + defendingType, () => {
		let attacker = typeToHermitMap.get(attackingType)!
		let defender = typeToHermitMap.get(defendingType)!
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
							query.row.index(0),
						)?.health,
					).toBe(defender.health - (attacker.primary.damage + 20))
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
}

describe('Type advantage tests', () => {
	createTypeAdvantageTest('Prankster', 'PvP')
	createTypeAdvantageTest('Redstoner', 'PvP')
	createTypeAdvantageTest('PvP', 'Speedrunner')
	createTypeAdvantageTest('PvP', 'Farm')
	createTypeAdvantageTest('Farm', 'Explorer')
	createTypeAdvantageTest('Explorer', 'Builder')
	createTypeAdvantageTest('Builder', 'Terraformer')
	createTypeAdvantageTest('Terraformer', 'Redstoner')
	createTypeAdvantageTest('Miner', 'Redstoner')
	createTypeAdvantageTest('Miner', 'Prankster')
	createTypeAdvantageTest('Speedrunner', 'Miner')
	createTypeAdvantageTest('Speedrunner', 'Prankster')
	createTypeAdvantageTest('Prankster', 'Builder')
})