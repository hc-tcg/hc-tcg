import assert from 'assert'
import {
	BoardSlotComponent,
	CardComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {TurnAction} from 'common/types/game-state'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {getLocalCard} from 'server/utils/state-gen'
import {choose} from './utils'
import FrozenEffect from 'common/status-effects/frozen'

function cardIsPlayable(game: GameModel, card: CardComponent) {
	return (
		game.components.find(SlotComponent, card.props.attachCondition) !== null
	)
}

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): AnyTurnActionData {
	const {player} = component

	let availableActions: Array<TurnAction>

	if (game.currentPlayer.entity === player.entity) {
		availableActions = game.state.turn.availableActions.slice()
	} else {
		availableActions = game.state.turn.opponentAvailableActions.slice()
	}

	if (availableActions.length === 0) {
		throw new Error(
			'There should never be a state in the game where there are no available actions',
		)
	}

	if (game.rng() < 0.2 && availableActions.length >= 2) {
		availableActions = availableActions.filter(
			(x) => x != 'CHANGE_ACTIVE_HERMIT',
		)
	}

	let nextAction = choose(availableActions, game.rng)

	if (game.rng() < 0.6 && availableActions.includes('PRIMARY_ATTACK')) {
		nextAction = 'PRIMARY_ATTACK'
	}
	if (game.rng() < 0.6 && availableActions.includes('SECONDARY_ATTACK')) {
		nextAction = 'SECONDARY_ATTACK'
	}

	if (nextAction === 'PLAY_HERMIT_CARD') {
		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isHealth,
				cardIsPlayable,
			),
			game.rng,
		)

		const slot = choose(
			game.components.filter(BoardSlotComponent, card.props.attachCondition),
			game.rng,
		)

		return {
			type: 'PLAY_HERMIT_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PLAY_EFFECT_CARD') {
		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isAttach,
				cardIsPlayable,
			),
			game.rng,
		)

		const slot = choose(
			game.components.filter(BoardSlotComponent, card.props.attachCondition),
			game.rng,
		)

		return {
			type: 'PLAY_EFFECT_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PLAY_ITEM_CARD') {
		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isItem,
				cardIsPlayable,
			),
			game.rng,
		)

		const slot = choose(
			game.components.filter(BoardSlotComponent, card.props.attachCondition),
			game.rng,
		)

		return {
			type: 'PLAY_ITEM_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PLAY_SINGLE_USE_CARD') {
		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isSingleUse,
				cardIsPlayable,
			),
			game.rng,
		)

		const slot = game.components.find(
			BoardSlotComponent,
			card.props.attachCondition,
		)

		assert(slot, 'There is always a single use slot')

		return {
			type: 'PLAY_SINGLE_USE_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PRIMARY_ATTACK') {
		return {
			type: 'PRIMARY_ATTACK',
		}
	}

	if (nextAction === 'SECONDARY_ATTACK') {
		return {
			type: 'SECONDARY_ATTACK',
		}
	}

	if (nextAction === 'SINGLE_USE_ATTACK') {
		return {
			type: 'SINGLE_USE_ATTACK',
		}
	}

	if (nextAction === 'CHANGE_ACTIVE_HERMIT') {
		const inactiveHermit = choose(
			game.components.filter(
				BoardSlotComponent,
				query.slot.hermit,
				query.slot.row(query.row.hermitSlotOccupied),
				query.slot.player(player.entity),
				query.not(query.slot.active),
				query.not(query.slot.hasStatusEffect(FrozenEffect)),
			),
			game.rng,
		)

		return {
			type: 'CHANGE_ACTIVE_HERMIT',
			entity: inactiveHermit?.entity,
		}
	}

	if (nextAction === 'REMOVE_EFFECT') {
		return {
			type: 'REMOVE_EFFECT',
		}
	}

	if (nextAction === 'END_TURN') {
		return {
			type: 'END_TURN',
		}
	}

	if (nextAction === 'PICK_REQUEST') {
		let slot = choose(
			game.getPickableSlots(game.state.pickRequests[0].canPick),
			game.rng,
		)
		return {
			type: 'PICK_REQUEST',
			entity: slot,
		}
	}

	if (nextAction === 'MODAL_REQUEST') {
		let modal = game.state.modalRequests[0].modal
		if (modal.type === 'selectCards') {
			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: false,
					cards: null,
				},
			}
		} else if (modal.type === 'copyAttack') {
			let rng = game.rng()
			if (modal.cancelable && rng < 0.3) {
				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						cancel: true,
					},
				}
			} else {
				let rng = game.rng()
				if (modal.cancelable && rng < 0.5) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							pick: 'primary',
						},
					}
				} else {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							pick: 'secondary',
						},
					}
				}
			}
		} else if (modal.type === 'dragCards') {
			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: false,
					leftCards: null,
					rightCards: null,
				},
			}
		}
		throw new Error('Unknown modal type: ' + (modal as any).type)
	}

	if (nextAction === 'APPLY_EFFECT') {
		return {
			type: 'APPLY_EFFECT',
		}
	}

	throw new Error('Should never reach here: ' + nextAction)
}

export const FuzzAI: VirtualAI = {
	id: 'fuzz_ai',
	getTurnActions: function* (game, component) {
		while (true) {
			let next = getNextTurnAction(game, component)
			yield next
		}
	},
}
