import {describe, expect, test} from '@jest/globals'
import ArchitectFalseRare from 'common/cards/alter-egos-iii/hermits/architectfalse-rare'
import PoePoeSkizzRare from 'common/cards/alter-egos-iii/hermits/poepoeskizz-rare'
import RenbobRare from 'common/cards/alter-egos/hermits/renbob-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import EvilXisumaBossHermitCard from 'common/cards/boss/hermits/evilxisuma_boss'
import RendogRare from 'common/cards/default/hermits/rendog-rare'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
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
	pick,
	playCardFromHand,
	testBossFight,
} from './utils'

function* testConsecutiveAmnesia(game: GameModel) {
	yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBossHermitCard, 'hermit', 0)

	yield* bossAttack(game, '50DMG')

	yield* endTurn(game)

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
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(
				PrimaryAttackDisabledEffect,
				SecondaryAttackDisabledEffect,
			),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	yield* bossAttack(game, '50DMG', 'ABLAZE')

	yield* endTurn(game)

	expect(game.currentPlayer.activeRow?.health).toBe(
		ArchitectFalseRare.health - 50,
	)

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
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(
				PrimaryAttackDisabledEffect,
				SecondaryAttackDisabledEffect,
			),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeFalsy()
}

function* testVersusRendogRare(game: GameModel) {
	yield* playCardFromHand(game, RendogRare, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EvilXisumaBossHermitCard, 'hermit', 0)
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

	yield* playCardFromHand(game, EvilXisumaBossHermitCard, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, Anvil, 'single_use')
	expect(Anvil.attackPreview?.(game)).toBe('$A30$')

	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EvilXisumaBossHermitCard.health -
			80 /* Renbob Secondary */ -
			30 /* Anvil */,
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
		EvilXisumaBossHermitCard.health -
			90 /* PoePoe Skizz Secondary */ -
			20 /* Additional Jumpscare damage */,
	)
}

describe('Test Evil X Boss Fight', () => {
	test('Test Boss versus consecutive Amnesia', () => {
		testBossFight(
			{
				saga: testConsecutiveAmnesia,
				playerDeck: [ArchitectFalseRare],
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
})
