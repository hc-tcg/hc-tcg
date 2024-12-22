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
import {
	attack,
	bossAttack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	getWinner,
	pick,
	playCardFromHand,
	testBossFight,
} from '../utils'

function* testConsecutiveAmnesia(game: GameModel) {
	yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
	yield* bossAttack(game, '50DMG')
	yield* endTurn(game)

	yield* playCardFromHand(game, Anvil, 'single_use')
	yield* attack(game, 'secondary')
	yield* endTurn(game)

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

	yield* bossAttack(game, '50DMG', 'ABLAZE')
	yield* endTurn(game)

	expect(game.currentPlayer.activeRow?.health).toBe(
		ArchitectFalseRare.health - 50,
	)

	yield* playCardFromHand(game, Anvil, 'single_use')
	yield* attack(game, 'secondary')
	yield* endTurn(game)

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

function* testVersusRendogRare(game: GameModel) {
	yield* playCardFromHand(game, RendogRare, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
	yield* bossAttack(game, '50DMG')
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	// Pick target for Role Play
	yield* pick(game, query.slot.opponent, query.slot.hermit)
	yield* finishModalRequest(game, {pick: 'secondary'})
	// Pick attack to disable for Derpcoin
	yield* finishModalRequest(game, {pick: 'primary'})

	yield* endTurn(game)

	expect(game.getAllBlockedActions()).toContain('PRIMARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(PrimaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	yield* bossAttack(game, '50DMG', 'ABLAZE')
	yield* endTurn(game)

	expect(game.currentPlayer.activeRow?.health).toBe(RendogRare.health - 50)

	yield* attack(game, 'secondary')
	// Pick target for Role Play
	yield* pick(game, query.slot.opponent, query.slot.hermit)
	yield* finishModalRequest(game, {pick: 'secondary'})
	// Pick attack to disable for Derpcoin
	yield* finishModalRequest(game, {pick: 'primary'})

	yield* endTurn(game)

	expect(game.getAllBlockedActions()).toContain('PRIMARY_ATTACK')
	expect(
		game.components.filter(
			StatusEffectComponent,
			query.effect.is(PrimaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toHaveLength(1)
}

function* testDirectlyOpposite(game: GameModel) {
	yield* playCardFromHand(game, RenbobRare, 'hermit', 1)
	yield* playCardFromHand(game, PoePoeSkizzRare, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, Anvil, 'single_use')
	expect(Anvil.attackPreview?.(game)).toBe('$A30$')

	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EvilXisumaBoss.health - RenbobRare.secondary.damage - 30 /* Anvil */,
	)

	yield* endTurn(game)
	yield* bossAttack(game, '50DMG', 'HEAL150')
	yield* endTurn(game)
	yield* changeActiveHermit(game, 0)
	yield* endTurn(game)
	yield* endTurn(game)
	// Test Jumpscare
	yield* attack(game, 'secondary')
	yield* pick(
		game,
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

function* testNineAttached(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
	yield* playCardFromHand(game, GoldArmor, 'attach', 0)
	yield* playCardFromHand(game, GoldArmor, 'attach', 1)
	yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
	yield* endTurn(game)
	// Boss Turn 1
	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
	const nineEffect = game.components.filter(
		StatusEffectComponent,
		query.effect.is(ExBossNineEffect),
		query.effect.targetIsCardAnd(query.card.currentPlayer),
	)[0]
	expect(nineEffect).not.toBe(undefined)
	yield* endTurn(game)

	yield* playCardFromHand(game, BalancedItem, 'item', 0, 1)
	yield* endTurn(game)
	// Boss Turn 2
	yield* endTurn(game)

	yield* playCardFromHand(game, BalancedItem, 'item', 1, 0)
	yield* endTurn(game)
	// Boss Turns 3-8
	while (game.state.turn.turnNumber < 18) {
		yield* endTurn(game)
	}
	// Boss Turn 9
	expect(nineEffect.targetEntity).not.toBe(null)
	supplyNineSpecial(nineEffect, 'NINEATTACHED')
	yield* endTurn(game)

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

function* testChallengerVictory(game: GameModel) {
	yield* playCardFromHand(game, MumboJumboRare, 'hermit', 0)
	yield* playCardFromHand(game, MumboJumboRare, 'hermit', 1)
	yield* playCardFromHand(game, MumboJumboRare, 'hermit', 2)
	yield* playCardFromHand(game, PranksterDoubleItem, 'item', 0, 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
	yield* bossAttack(game, '50DMG')
	yield* endTurn(game)

	yield* playCardFromHand(game, PranksterDoubleItem, 'item', 1, 0)
	yield* attack(game, 'secondary')
	yield* endTurn(game)

	yield* bossAttack(game, '50DMG')
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.lives).toBe(2)
	yield* endTurn(game)

	yield* bossAttack(game, '50DMG', 'ABLAZE')
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	yield* endTurn(game)

	yield* bossAttack(game, '50DMG', 'ABLAZE')
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.lives).toBe(1)
	yield* endTurn(game)

	yield* bossAttack(game, '50DMG', 'ABLAZE', 'EFFECTCARD')
	expect(game.opponentPlayer.lives).toBe(2)
	yield* endTurn(game)

	yield* changeActiveHermit(game, 1)
	yield* attack(game, 'secondary')
	yield* endTurn(game)

	yield* bossAttack(game, '50DMG', 'ABLAZE', 'EFFECTCARD')
	yield* endTurn(game)

	yield* attack(game, 'secondary')
}

describe('Test Evil X Boss Fight', () => {
	test('Test Boss versus consecutive Amnesia', () => {
		testBossFight(
			{
				saga: testConsecutiveAmnesia,
				playerDeck: [ArchitectFalseRare, Anvil, Anvil],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Boss versus rare Rendog', () => {
		testBossFight(
			{
				saga: testVersusRendogRare,
				playerDeck: [RendogRare],
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Boss is "directly opposite" opponent active hermit', () => {
		testBossFight(
			{
				saga: testDirectlyOpposite,
				playerDeck: [PoePoeSkizzRare, RenbobRare, Anvil],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test "NINEATTACHED" discards all cards from active', () => {
		testBossFight(
			{
				saga: testNineAttached,
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

	test('Test challenger victory against boss', () => {
		testBossFight(
			{
				playerDeck: [
					MumboJumboRare,
					MumboJumboRare,
					MumboJumboRare,
					PranksterDoubleItem,
					PranksterDoubleItem,
				],
				saga: testChallengerVictory,
				then: (game) => {
					expect(getWinner(game)?.playerName).toBe('playerOne')
					expect(game.outcome).toHaveProperty('victoryReason', 'lives')
				},
			},
			{startWithAllCards: true, forceCoinFlip: true},
		)
	})

	test('Test boss victory against challenger', () => {
		testBossFight(
			{
				playerDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
					yield* bossAttack(game, '90DMG')
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

		testBossFight(
			{
				playerDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
					yield* bossAttack(game, '90DMG')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* bossAttack(game, '90DMG')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* bossAttack(game, '90DMG')
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
