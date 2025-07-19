import {describe, expect, test} from '@jest/globals'
import ArchitectFalseRare from 'common/cards/hermits/architectfalse-rare'
import BeetlejhostRare from 'common/cards/hermits/beetlejhost-rare'
import BoomerBdubsRare from 'common/cards/hermits/boomerbdubs-rare'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import JoeHillsRare from 'common/cards/hermits/joehills-rare'
import SmallishbeansCommon from 'common/cards/hermits/smallishbeans-common'
import WormManRare from 'common/cards/hermits/wormman-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import PvPItem from 'common/cards/items/pvp-common'
import Bow from 'common/cards/single-use/bow'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import {
	CardComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import ChromaKeyedEffect from 'common/status-effects/chroma-keyed'
import {SecondaryAttackDisabledEffect} from 'common/status-effects/singleturn-attack-disabled'
import {CopyAttack} from 'common/types/modal-requests'
import {TestGameFixture, testGame} from '../utils'

async function testPrimaryDoesNotCrash(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	await test.endTurn()

	await test.attack('primary')

	// Verify that the attack worked.
	expect(
		game.components.find(
			RowComponent,
			query.row.active,
			query.row.opponentPlayer,
		)?.health,
	).not.toEqual(EthosLabCommon.health)
}

async function testAmnesiaDisablesPuppetry(
	test: TestGameFixture,
	game: GameModel,
) {
	await test.playCardFromHand(ArchitectFalseRare, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

	await test.attack('secondary')

	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	await test.finishModalRequest({pick: 'primary'})

	await test.endTurn()

	await test.attack('secondary')

	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(
				query.card.opponentPlayer,
				query.card.active,
			),
		),
	).not.toBe(null)
}

async function testAmnesiaBlocksPuppetryMock(
	test: TestGameFixture,
	game: GameModel,
) {
	await test.playCardFromHand(ArchitectFalseRare, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.playCardFromHand(ZombieCleoRare, 'hermit', 1)
	await test.playCardFromHand(ChorusFruit, 'single_use')
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.endTurn()

	await test.attack('secondary')
	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(
				query.card.opponentPlayer,
				query.card.row(query.row.index(0)),
			),
		),
	).not.toBe(null)
	await test.endTurn()

	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(0),
	)
	expect(
		(game.state.modalRequests[0].modal as CopyAttack.Data).availableAttacks,
	).not.toContain('secondary')
	await test.finishModalRequest({pick: 'primary'})
}

async function testPuppetryCanceling(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(ZombieCleoRare, 'hermit', 1)
	await test.playCardFromHand(BoomerBdubsRare, 'hermit', 2)

	await test.attack('secondary')

	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	await test.finishModalRequest({pick: 'secondary'})

	expect(game.state.pickRequests).toHaveLength(1)
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)

	await test.finishModalRequest({cancel: true})

	await test.attack('secondary')

	expect(game.state.pickRequests).toHaveLength(1)
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	await test.finishModalRequest({pick: 'secondary'})

	expect(game.state.pickRequests).toHaveLength(1)
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)

	await test.finishModalRequest({pick: 'secondary'})
	// Flip one coin for "Watch This"
	await test.finishModalRequest({result: true, cards: null})
	await test.finishModalRequest({result: false, cards: null})

	expect(
		game.components.find(
			RowComponent,
			query.row.opponentPlayer,
			query.row.active,
		)?.health,
	).toBe(
		EthosLabCommon.health -
			80 /** Boomer Bdubs' base secondary damage */ -
			20 /** Extra damage from exactly 1 heads */,
	)
}

async function testPuppetingJopacity(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(SmallishbeansCommon, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(BeetlejhostRare, 'hermit', 1)
	await test.playCardFromHand(SmallishbeansCommon, 'hermit', 2)

	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.finishModalRequest({pick: 'secondary'})

	await test.endTurn()
	await test.endTurn()

	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.finishModalRequest({pick: 'secondary'})

	expect(game.opponentPlayer.activeRow?.health).toBe(
		SmallishbeansCommon.health -
			BeetlejhostRare.secondary.damage -
			(BeetlejhostRare.secondary.damage - 10),
	)

	await test.endTurn()
	await test.endTurn()

	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)
	await test.finishModalRequest({pick: 'secondary'})

	expect(game.opponentPlayer.activeRow?.health).toBe(
		SmallishbeansCommon.health -
			BeetlejhostRare.secondary.damage -
			(BeetlejhostRare.secondary.damage - 10) -
			SmallishbeansCommon.secondary.damage,
	)

	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(ChromaKeyedEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBe(null)
}

async function testPuppetryDiscardingItem(
	test: TestGameFixture,
	game: GameModel,
) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(PvPItem, 'item', 0, 0)
	await test.playCardFromHand(HypnotizdRare, 'hermit', 1)
	await test.attack('secondary')

	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	await test.finishModalRequest({pick: 'secondary'})

	await test.pick(
		query.slot.opponent,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	await test.pick(
		query.slot.currentPlayer,
		query.slot.item,
		query.slot.index(0),
		query.slot.rowIndex(0),
	)

	expect(
		game.components.find(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
			query.slot.rowIndex(0),
			query.slot.index(0),
		)?.card,
	).toBe(null)
}

async function testPuppetingTotalAnonymity(
	test: TestGameFixture,
	game: GameModel,
) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(WormManRare, 'hermit', 1)
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.finishModalRequest({pick: 'secondary'})
	await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
	expect(
		game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.slot(query.slot.rowIndex(2)),
		)?.turnedOver,
	).toBe(true)
	await test.endTurn()

	await test.attack('secondary')
	await test.endTurn()

	await test.endTurn()

	await test.attack('secondary')
	await test.endTurn()

	await test.endTurn()

	await test.attack('secondary')
	expect(
		game.components.find(
			CardComponent,
			query.card.opponentPlayer,
			query.card.slot(query.slot.rowIndex(2)),
		)?.turnedOver,
	).toBe(false)
}

async function testPuppetingTimeSkip(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
	await test.endTurn()

	await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
	await test.playCardFromHand(JoeHillsRare, 'hermit', 1)
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.finishModalRequest({pick: 'secondary'})
	await test.endTurn()

	await test.changeActiveHermit(1)
	await test.endTurn()

	await test.playCardFromHand(Bow, 'single_use')
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	expect(
		(game.state.modalRequests[0].modal as CopyAttack.Data).availableAttacks,
	).not.toContain('secondary')
	await test.finishModalRequest({pick: 'primary'})
	await test.removeEffect()
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	await test.finishModalRequest({pick: 'primary'})
}

describe('Test Zombie Cleo', () => {
	test('Test Zombie Cleo Primary Does Not Crash Server', async () => {
		await testGame(
			{
				testGame: testPrimaryDoesNotCrash,
				playerOneDeck: [ZombieCleoRare],
				playerTwoDeck: [EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Puppetry is Disabled by Amnesia', async () => {
		await testGame(
			{
				testGame: testAmnesiaDisablesPuppetry,
				playerOneDeck: [ArchitectFalseRare],
				playerTwoDeck: [ZombieCleoRare, EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Amnesia Blocks Mocking Attack with Puppetry', async () => {
		await testGame(
			{
				testGame: testAmnesiaBlocksPuppetryMock,
				playerOneDeck: [ArchitectFalseRare],
				playerTwoDeck: [EthosLabCommon, ZombieCleoRare, ChorusFruit],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Puppetry After Canceling', async () => {
		await testGame(
			{
				testGame: testPuppetryCanceling,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, ZombieCleoRare, BoomerBdubsRare],
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test using Puppetry on Jopacity', async () => {
		await testGame(
			{
				testGame: testPuppetingJopacity,
				playerOneDeck: [SmallishbeansCommon],
				playerTwoDeck: [ZombieCleoRare, BeetlejhostRare, SmallishbeansCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Puppeting an attack that requites an item to be discarded', async () => {
		await testGame(
			{
				testGame: testPuppetryDiscardingItem,
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, PvPItem, HypnotizdRare],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test using Puppetry on Total Anonymity', async () => {
		await testGame(
			{
				testGame: testPuppetingTotalAnonymity,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, WormManRare, EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Test using Puppetry on Let's Go with Chorus Fruit", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, Cubfan135Rare, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(Cubfan135Rare, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.finishModalRequest({pick: 'secondary'})
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(game.currentPlayer.activeRow?.index).toBe(1)
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(game.currentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test using Puppetry on Time Skip', async () => {
		await testGame(
			{
				testGame: testPuppetingTimeSkip,
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, JoeHillsRare, Bow],
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
