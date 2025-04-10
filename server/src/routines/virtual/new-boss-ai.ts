import NewBoss, {
	BOSS_ATTACK,
	supplyBossAttack,
} from 'common/cards/boss/hermits/new_boss'
import {
	BoardSlotComponent,
	CardComponent,
	PlayerComponent,
	StatusEffectComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'

const fireDropper = (game: GameModel) => {
	return Math.floor(game.rng() * 9)
}

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): Array<AnyTurnActionData> {
	const {player} = component

	if (game.state.modalRequests.length) {
		if (['Allay', 'Lantern'].includes(game.state.modalRequests[0].modal.name)) {
			// Handles when challenger reveals card(s) to boss
			return [
				{
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				},
			]
		}
	}

	if (game.state.turn.turnNumber === 2) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			query.card.is(NewBoss),
			query.card.slot(query.slot.hand),
		)
		const slot = game.components.findEntity(
			BoardSlotComponent,
			query.slot.player(player.entity),
			query.slot.hermit,
		)
		if (bossCard && slot) {
			return [
				{
					type: 'PLAY_HERMIT_CARD',
					slot,
					card: {
						id: bossCard.props.numericId,
						entity: bossCard.entity,
						slot: bossCard.slotEntity,
						turnedOver: false,
						attackHint: null,
						prizeCard: false,
					},
				},
			]
		}
	}

	const attackType = game.state.turn.availableActions.find(
		(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
	)
	if (attackType) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit),
		)
		if (bossCard === null)
			throw new Error(`Boss's active hermit cannot be found, please report`)
		const bossAttack = getBossAttack(component.player, game)
		supplyBossAttack(bossCard, bossAttack)
		for (const sound of bossAttack) {
			game.voiceLineQueue.push(`/voice/${sound}.ogg`)
		}
		return [
			{type: 'DELAY', delay: bossAttack.length * 3000},
			{type: attackType},
		]
	}

	if (!game.state.turn.availableActions.includes('END_TURN'))
		throw new Error('Boss does not know what to do in this state, please report')

	return [{type: 'END_TURN'}]
}

function getBossAttack(player: PlayerComponent, game: GameModel): BOSS_ATTACK {
	const bossCard = game.components.find(
		CardComponent,
		query.card.currentPlayer,
		query.card.active,
		query.card.slot(query.slot.hermit),
	)
	if (!bossCard) throw new Error(`Boss's active hermit cannot be found, please report`)

	const nineEffect = game.components.find(
		StatusEffectComponent,
		query.effect.targetEntity(bossCard.entity),
		query.effect.is(ExBossNineEffect),
	)
	if (nineEffect) {
		supplyNineSpecial(nineEffect, 'NINEATTACHED')
		return ['90DMG', 'DOUBLE', 'EFFECTCARD']
	}

	const opponentActiveHermit = game.components.find(
		CardComponent,
		query.card.opponentPlayer,
		query.card.active,
		query.card.slot(query.slot.hermit),
	)
	if (!opponentActiveHermit) {
		return ['50DMG', 'AFK20', undefined]
	}

	const opponentHealth = opponentActiveHermit.slot.inRow() 
		? opponentActiveHermit.slot.row.health ?? 0 
		: 0
	if (opponentHealth <= 50) {
		return ['50DMG', undefined, undefined]
	}

	const bossHealth = bossCard.slot.inRow() 
		? bossCard.slot.row.health ?? 0 
		: 0
	if (bossHealth <= 150) {
		return ['70DMG', 'HEAL150', undefined]
	}

	return ['90DMG', 'ABLAZE', undefined]
}

const NewBossAI: VirtualAI = {
	id: 'new_boss',

	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}

export default NewBossAI 