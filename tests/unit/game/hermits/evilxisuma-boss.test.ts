import {describe, expect, test} from '@jest/globals'
import {GoldArmor} from 'common/cards/attach/armor'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import ArchitectFalseRare from 'common/cards/hermits/architectfalse-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import MumboJumboRare from 'common/cards/hermits/mumbojumbo-rare'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import PranksterDoubleItem from 'common/cards/items/prankster-rare'
import Anvil from 'common/cards/single-use/anvil'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from 'common/status-effects/singleturn-attack-disabled'
import {BossGameTestFixture, getWinner, testBossFight} from '../utils'

async function testConsecutiveAmnesia(
	test: BossGameTestFixture,
	game: GameModel,
) {
	await test.playCardFromHand(ArchitectFalseRare, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
	await test.bossAttack('50DMG')
	await test.endTurn()

	await test.playCardFromHand(Anvil, 'single_use')
	await test.attack('secondary')
	await test.endTurn()

	expect(
		game
			.getAllBlockedActions()
			.filter(
				(action) =>
					action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
			),
	).toHaveLength(1)
	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(
				PrimaryAttackDisabledEffect,
				SecondaryAttackDisabledEffect,
			),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).not.toBeNull()

	await test.bossAttack('50DMG', 'ABLAZE')
	await test.endTurn()

	expect(game.currentPlayer.activeRow?.health).toBe(
		ArchitectFalseRare.health - 50,
	)

	await test.playCardFromHand(Anvil, 'single_use')
	await test.attack('secondary')
	await test.endTurn()

	// The status should not be present.
	expect(
		game
			.getAllBlockedActions()
			.filter(
				(action) =>
					action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
			),
	).toStrictEqual([])
	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(
				PrimaryAttackDisabledEffect,
				SecondaryAttackDisabledEffect,
			),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeNull()
}

async function testVersusRendogRare(
	test: BossGameTestFixture,
	game: GameModel,
) {
	await test.playCardFromHand(RendogRare, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
	await test.bossAttack('50DMG')
	await test.endTurn()

	await test.attack('secondary')
	// Pick target for Role Play
	await test.pick(query.slot.opponent, query.slot.hermit)
	await test.finishModalRequest({pick: 'secondary'})
	// Pick attack to disable for Derpcoin
	await test.finishModalRequest({pick: 'primary'})

	await test.endTurn()

	expect(game.getAllBlockedActions()).toContain('PRIMARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(PrimaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	await test.bossAttack('50DMG', 'ABLAZE')
	await test.endTurn()

	expect(game.currentPlayer.activeRow?.health).toBe(RendogRare.health - 50)

	await test.attack('secondary')
	// Pick target for Role Play
	await test.pick(query.slot.opponent, query.slot.hermit)
	await test.finishModalRequest({pick: 'secondary'})
	// Pick attack to disable for Derpcoin
	await test.finishModalRequest({pick: 'primary'})

	await test.endTurn()

	expect(game.getAllBlockedActions()).toContain('PRIMARY_ATTACK')
	expect(
		game.components.filter(
			StatusEffectComponent,
			query.effect.is(PrimaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toHaveLength(1)
}

async function testDirectlyOpposite(
	test: BossGameTestFixture,
	game: GameModel,
) {
	await test.playCardFromHand(RenbobRare, 'hermit', 1)
	await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(Anvil, 'single_use')
	expect(Anvil.attackPreview?.(game)).toBe('$A30$')

	await test.attack('secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EvilXisumaBoss.health - RenbobRare.secondary.damage - 30 /* Anvil */,
	)

	await test.endTurn()
	await test.bossAttack('50DMG', 'HEAL150')
	await test.endTurn()
	await test.changeActiveHermit(0)
	await test.endTurn()
	await test.endTurn()
	// Test Jumpscare
	await test.attack('secondary')
	await test.pick(
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)

	expect(game.opponentPlayer.activeRow?.health).toBe(
		EvilXisumaBoss.health -
			PoePoeSkizzRare.secondary.damage -
			20 /* Additional Jumpscare damage */,
	)
}

async function testNineAttached(test: BossGameTestFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
	await test.playCardFromHand(GoldArmor, 'attach', 0)
	await test.playCardFromHand(GoldArmor, 'attach', 1)
	await test.playCardFromHand(BalancedItem, 'item', 0, 0)
	await test.endTurn()
	// Boss Turn 1
	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
	const nineEffect = game.components.filter(
		StatusEffectComponent,
		query.effect.is(ExBossNineEffect),
		query.effect.targetIsCardAnd(query.card.currentPlayer),
	)[0]
	expect(nineEffect).not.toBe(undefined)
	await test.endTurn()

	await test.playCardFromHand(BalancedItem, 'item', 0, 1)
	await test.endTurn()
	// Boss Turn 2
	await test.endTurn()

	await test.playCardFromHand(BalancedItem, 'item', 1, 0)
	await test.endTurn()
	// Boss Turns 3-8
	while (game.state.turn.turnNumber < 18) {
		await test.endTurn()
	}
	// Boss Turn 9
	expect(nineEffect.targetEntity).not.toBe(null)
	supplyNineSpecial(nineEffect, 'NINEATTACHED')
	await test.endTurn()

	expect(nineEffect.targetEntity).toBe(null)
	expect(
		game.components
			.filter(
				CardComponent,
				query.card.currentPlayer,
				query.card.active,
				query.card.slot(query.not(query.slot.hermit)),
			)
			.map((card) => card.props),
	).toStrictEqual([])
	expect(
		game.components
			.filter(
				CardComponent,
				query.card.currentPlayer,
				query.card.slot(query.slot.discardPile),
			)
			.map((card) => card.props),
	).toHaveLength(3)
}

async function testChallengerVictory(
	test: BossGameTestFixture,
	game: GameModel,
) {
	await test.playCardFromHand(MumboJumboRare, 'hermit', 0)
	await test.playCardFromHand(MumboJumboRare, 'hermit', 1)
	await test.playCardFromHand(MumboJumboRare, 'hermit', 2)
	await test.playCardFromHand(PranksterDoubleItem, 'item', 0, 0)
	await test.endTurn()

	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
	await test.bossAttack('50DMG')
	await test.endTurn()

	await test.playCardFromHand(PranksterDoubleItem, 'item', 1, 0)
	await test.attack('secondary')
	await test.endTurn()

	await test.bossAttack('50DMG')
	await test.endTurn()

	await test.attack('secondary')
	expect(game.opponentPlayer.lives).toBe(2)
	await test.endTurn()

	await test.bossAttack('50DMG', 'ABLAZE')
	await test.endTurn()

	await test.attack('secondary')
	await test.endTurn()

	await test.bossAttack('50DMG', 'ABLAZE')
	await test.endTurn()

	await test.attack('secondary')
	expect(game.opponentPlayer.lives).toBe(1)
	await test.endTurn()

	await test.bossAttack('50DMG', 'ABLAZE', 'EFFECTCARD')
	expect(game.opponentPlayer.lives).toBe(2)
	await test.endTurn()

	await test.changeActiveHermit(1)
	await test.attack('secondary')
	await test.endTurn()

	await test.bossAttack('50DMG', 'ABLAZE', 'EFFECTCARD')
	await test.endTurn()

	await test.attack('secondary')
}

describe('Test Evil X Boss Fight', () => {
	test('Test Boss versus consecutive Amnesia', async () => {
		await testBossFight(
			{
				testGame: testConsecutiveAmnesia,
				playerDeck: [ArchitectFalseRare, Anvil, Anvil],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Boss versus rare Rendog', async () => {
		await testBossFight(
			{
				testGame: testVersusRendogRare,
				playerDeck: [RendogRare],
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Boss is "directly opposite" opponent active hermit', async () => {
		await testBossFight(
			{
				testGame: testDirectlyOpposite,
				playerDeck: [PoePoeSkizzRare, RenbobRare, Anvil],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test "NINEATTACHED" discards all cards from active', async () => {
		await testBossFight(
			{
				testGame: testNineAttached,
				playerDeck: [
					EthosLabCommon,
					EthosLabCommon,
					BalancedItem,
					BalancedItem,
					BalancedItem,
					GoldArmor,
					GoldArmor,
				],
			},
			{startWithAllCards: true},
		)
	})

	test('Test challenger victory against boss', async () => {
		await testBossFight(
			{
				playerDeck: [
					MumboJumboRare,
					MumboJumboRare,
					MumboJumboRare,
					PranksterDoubleItem,
					PranksterDoubleItem,
				],
				testGame: testChallengerVictory,
				then: (game) => {
					expect(getWinner(game)?.playerName).toBe('playerOne')
					expect(game.outcome).toHaveProperty('victoryReason', 'lives')
				},
			},
			{startWithAllCards: true, forceCoinFlip: true},
		)
	})

	test('Test boss victory against challenger', async () => {
		await testBossFight(
			{
				playerDeck: [EthosLabCommon],
				testGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
					await test.bossAttack('90DMG')
				},
				then: (game) => {
					expect(getWinner(game)?.playerName).toBe('Evil Xisuma')
					expect(game.outcome).toHaveProperty(
						'victoryReason',
						'no-hermits-on-board',
					)
				},
			},
			{startWithAllCards: true, oneShotMode: true},
		)

		await testBossFight(
			{
				playerDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				testGame: async (test, _game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
					await test.bossAttack('90DMG')
					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.bossAttack('90DMG')
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.bossAttack('90DMG')
				},
				then: (game) => {
					expect(getWinner(game)?.playerName).toBe('Evil Xisuma')
					expect(game.outcome).toHaveProperty('victoryReason', 'lives')
				},
			},
			{startWithAllCards: true, oneShotMode: true},
		)
	})
})
