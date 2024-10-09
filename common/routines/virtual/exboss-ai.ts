import EvilXisumaBoss, {
	BOSS_ATTACK,
	supplyBossAttack,
} from '../../cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	CardComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import {AIComponent} from '../../components/ai-component'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import ExBossNineEffect, {
	supplyNineSpecial,
} from '../../status-effects/exboss-nine'
import {WithoutFunctions} from '../../types/server-requests'
import {AnyTurnActionData} from '../../types/turn-action-data'
import {VirtualAI} from '../../types/virtual-ai'

const fireDropper = () => {
	return Math.floor(Math.random() * 9)
}

function getBossAttack(player: PlayerComponent) {
	const lives = player.lives

	const attackIndexes: {
		damage: number
		secondary?: number
		tertiary?: number
	} = {damage: fireDropper()}

	if (lives === 3) {
		attackIndexes.damage = [0, 0, 1, 1, 1, 2, 2, 2, 2][attackIndexes.damage]
	} else {
		let secondary = fireDropper()
		if (lives === 2) {
			attackIndexes.damage = [0, 0, 0, 1, 1, 1, 2, 2, 2][attackIndexes.damage]
			attackIndexes.secondary = [0, 0, 0, 1, 1, 1, 2, 2, 2][secondary]
		} else {
			attackIndexes.damage = [0, 0, 0, 0, 1, 1, 1, 2, 2][attackIndexes.damage]
			attackIndexes.secondary = [0, 0, 0, 0, 1, 1, 1, 2, 2][secondary]
			attackIndexes.tertiary = [0, 0, 0, 0, 1, 1, 1, 2, 2][fireDropper()]
		}
	}

	const attackDef: BOSS_ATTACK = [
		(['50DMG', '70DMG', '90DMG'] as const)[attackIndexes.damage],
	]
	if (attackIndexes.secondary !== undefined) {
		attackDef[1] = (['HEAL150', 'ABLAZE', 'DOUBLE'] as const)[
			attackIndexes.secondary
		]
		if (attackIndexes.tertiary !== undefined)
			attackDef[2] = (['EFFECTCARD', 'AFK20', 'ITEMCARD'] as const)[
				attackIndexes.tertiary
			]
	}

	return attackDef
}

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): Array<AnyTurnActionData> {
	const {player} = component

	if (game.state.modalRequests.length) {
		if (game.state.modalRequests[0].modal.name.startsWith('Lantern')) {
			// Handles when challenger plays "Lantern"
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
			query.card.is(EvilXisumaBoss),
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
						props: WithoutFunctions(bossCard.props),
						entity: bossCard.entity,
						slot: bossCard.slotEntity,
						turnedOver: false,
						attackHint: null,
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
			throw new Error(`EX's active hermit cannot be found, please report`)
		const bossAttack = getBossAttack(component.player)
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
		throw new Error('EX does not know what to do in this state, please report')

	const nineEffect = game.components.find(
		StatusEffectComponent,
		query.effect.is(ExBossNineEffect),
		query.effect.targetIsCardAnd(query.card.player(player.entity)),
	)
	if (nineEffect && nineEffect.counter === 0) {
		const nineSpecial = Math.random() > 0.5 ? 'NINEDISCARD' : 'NINEATTACHED'
		supplyNineSpecial(nineEffect, nineSpecial)
		game.voiceLineQueue.push(`/voice/${nineSpecial}.ogg`)
		return [{type: 'DELAY', delay: 10600}, {type: 'END_TURN'}]
	}

	return [{type: 'END_TURN'}]
}

const ExBossAI: VirtualAI = {
	id: 'evilxisuma_boss',

	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}

export default ExBossAI
