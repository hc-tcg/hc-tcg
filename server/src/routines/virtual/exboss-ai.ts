import {delay} from 'typed-redux-saga'
import {AttackActionData, PlayCardActionData} from 'common/types/action-data'
import {GameModel} from 'common/models/game-model'
import {AttackAction} from 'common/types/game-state'
import {broadcast} from '../../utils/comm'
import {VirtualAI, VirtualAIReturn} from './virtual-action'
import {BOSS_ATTACK, supplyBossAttack} from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	CardComponent,
	PlayerComponent,
	StatusEffectComponent,
} from 'common/components'
import * as query from 'common/components/query'
import ExBossNineStatusEffect from 'common/status-effects/exboss-nine'
import {WithoutFunctions} from 'common/types/server-requests'

class ExBossAI implements VirtualAI {
	get id(): string {
		return 'evilxisuma_boss'
	}

	private fireDropper() {
		return Math.floor(Math.random() * 9)
	}

	getBossAttack(player: PlayerComponent) {
		const lives = player.lives

		const attackIndexes: {
			damage: number
			secondary?: number
			tertiary?: number
		} = {damage: this.fireDropper()}

		if (lives === 3) {
			attackIndexes.damage = [0, 0, 1, 1, 1, 2, 2, 2, 2][attackIndexes.damage]
		} else {
			let secondary = this.fireDropper()
			if (lives === 2) {
				attackIndexes.damage = [0, 0, 0, 1, 1, 1, 2, 2, 2][attackIndexes.damage]
				attackIndexes.secondary = [0, 0, 0, 1, 1, 1, 2, 2, 2][secondary]
			} else {
				attackIndexes.damage = [0, 0, 0, 0, 1, 1, 1, 2, 2][attackIndexes.damage]
				attackIndexes.secondary = [0, 0, 0, 0, 1, 1, 1, 2, 2][secondary]
				attackIndexes.tertiary = [0, 0, 0, 0, 1, 1, 1, 2, 2][this.fireDropper()]
			}
		}

		const attackDef: BOSS_ATTACK = [(['50DMG', '70DMG', '90DMG'] as const)[attackIndexes.damage]]
		if (attackIndexes.secondary !== undefined) {
			attackDef[1] = (['HEAL150', 'ABLAZE', 'DOUBLE'] as const)[attackIndexes.secondary]
			if (attackIndexes.tertiary !== undefined)
				attackDef[2] = (['EFFECTCARD', 'AFK20', 'ITEMCARD'] as const)[attackIndexes.tertiary]
		}

		return attackDef
	}

	*getTurnAction(game: GameModel): Generator<any, VirtualAIReturn> {
		if (game.state.modalRequests.length)
			if (game.state.modalRequests[0].data.payload.modalName.startsWith('Lantern'))
				// Handles when challenger plays "Lantern"
				return {
					type: 'MODAL_REQUEST',
					playerId: game.opponentPlayer.id,
					payload: {result: true, cards: null},
				}

		const {currentPlayer} = game

		if (game.state.turn.turnNumber === 2) {
			const bossCard = currentPlayer.getHand().find((card) => card.props.id === 'evilxisuma_boss')
			const slot = game.components.findEntity(
				BoardSlotComponent,
				query.slot.currentPlayer,
				query.slot.hermit
			)
			if (bossCard && slot) {
				const playHermitCard: PlayCardActionData & {playerId: string} = {
					type: 'PLAY_HERMIT_CARD',
					payload: {
						slot,
						card: {
							props: WithoutFunctions(bossCard.props),
							entity: bossCard.entity,
							slot: bossCard.slotEntity,
							turnedOver: false,
						},
					},
					playerId: currentPlayer.id,
				}
				return playHermitCard
			}
		}

		const attackType = game.state.turn.availableActions.find(
			(action): action is AttackAction =>
				action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK'
		)
		if (attackType) {
			const attackAction: AttackActionData & {playerId: string} = {
				type: attackType,
				payload: {
					playerId: currentPlayer.id,
				},
				playerId: currentPlayer.id,
			}

			const bossCard = game.components.find(
				CardComponent,
				query.card.currentPlayer,
				query.card.active,
				query.card.slot(query.slot.hermit)
			)
			if (bossCard === null) throw new Error(`EX's active hermit cannot be found, please report`)
			const bossAttack = this.getBossAttack(currentPlayer)
			supplyBossAttack(bossCard, bossAttack)
			broadcast(game.getPlayers(), '@sound/VOICE_ANNOUNCE', {lines: bossAttack})
			yield* delay(bossAttack.length * 3000)
			// Waits after announcing attack to perform the action
			return attackAction
		}

		if (!game.state.turn.availableActions.includes('END_TURN'))
			throw new Error('EX does not know what to do in this state, please report')

		const nineEffect = game.components.find(
			StatusEffectComponent,
			query.effect.is(ExBossNineStatusEffect)
		)
		if (nineEffect && nineEffect.counter === 0) {
			currentPlayer.hooks.onTurnEnd.callSome([[]], (observer) => {
				const entity = game.components.get(game.components.get(observer)?.wrappingEntity || null)
				if (entity instanceof StatusEffectComponent) return entity === nineEffect
				return false
			})
			yield* delay(10600)
		}

		return {type: 'END_TURN', playerId: currentPlayer.id}
	}
}

export default ExBossAI
