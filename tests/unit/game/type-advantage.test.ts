import {describe, expect, test} from '@jest/globals'
import GoodTimesWithScarCommon from 'common/cards/hermits/goodtimeswithscar-common'
import GrianCommon from 'common/cards/hermits/grian-common'
import HotguyCommon from 'common/cards/hermits/hotguy-common'
import IJevinCommon from 'common/cards/hermits/ijevin-common'
import ImpulseSVCommon from 'common/cards/hermits/impulsesv-common'
import MumboJumboCommon from 'common/cards/hermits/mumbojumbo-common'
import PoultrymanCommon from 'common/cards/hermits/poultryman-common'
import TinFoilChefCommon from 'common/cards/hermits/tinfoilchef-common'
import XBCraftedCommon from 'common/cards/hermits/xbcrafted-common'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from './utils'

let typeToHermitMap = {
	Prankster: PoultrymanCommon,
	PvP: XBCraftedCommon,
	Redstoner: MumboJumboCommon,
	Speedrunner: HotguyCommon,
	Farm: ImpulseSVCommon,
	Explorer: IJevinCommon,
	Builder: GrianCommon,
	Terraformer: GoodTimesWithScarCommon,
	Miner: TinFoilChefCommon,
}

type HermitType = keyof typeof typeToHermitMap

function createTypeAdvantageTest(
	attackingType: HermitType,
	defendingType: HermitType,
) {
	test(attackingType + ' v ' + defendingType, () => {
		const attacker = typeToHermitMap[attackingType]
		const defender = typeToHermitMap[defendingType]
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
