import assert from 'assert'
import {
	BoardSlotComponent,
	CardComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {CardEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {TurnAction} from 'common/types/game-state'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {getLocalCard} from 'server/utils/state-gen'
import {choose, chooseN} from './utils'

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
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hermit),
				query.card.slot(query.not(query.slot.active)),
				(_game, value) =>
					player.hooks.beforeActiveRowChange
						.call(player.getActiveHermit(), value)
						.every(Boolean),
			),
			game.rng,
		)

		return {
			type: 'CHANGE_ACTIVE_HERMIT',
			entity: inactiveHermit.slot.entity,
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

		assert(
			query.some(
				query.not(query.slot.hand),
				query.every(query.slot.hand, query.slot.player(player.entity)),
			)(game, game.components.get(slot)!),
			"Players can not pick a card form their opponent's hand",
		)

		return {
			type: 'PICK_REQUEST',
			entity: slot,
		}
	}

	if (nextAction === 'MODAL_REQUEST') {
		let modal = game.state.modalRequests[0].modal
		if (modal.type === 'selectCards') {
			let rng = game.rng()
			if (modal.cancelable && rng < 0.3) {
				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						result: false,
						cards: null,
					},
				}
			}

			let selectionSize
			if (typeof modal.selectionSize === 'number') {
				selectionSize = [modal.selectionSize, modal.selectionSize]
			} else {
				selectionSize = modal.selectionSize
			}

			let cards = chooseN(
				modal.cards,
				Math.floor(game.rng() + selectionSize[0] * selectionSize[1]),
				game.rng,
			)

			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: true,
					cards: cards,
				},
			}
		} else if (modal.type === 'copyAttack') {
			let action = choose(
				['primary', 'secondary'].filter((x) =>
					modal.availableAttacks.includes(x as any),
				),
				game.rng,
			)
			if (game.rng() <= 0.3 && modal.cancelable) {
				action = 'cancel'
			}

			if (action === 'primary') {
				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						pick: 'primary',
					},
				}
			} else if (action === 'secondary') {
				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						pick: 'secondary',
					},
				}
			}
			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					cancel: true,
				},
			}
		} else if (modal.type === 'dragCards') {
			let rng = game.rng()
			if (rng < 0.3) {
				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						result: false,
						leftCards: null,
						rightCards: null,
					},
				}
			}

			let cards = [...modal.leftCards, ...modal.rightCards]
			let outputLeft = []
			let outputRight = []

			while (outputLeft.length + outputRight.length < cards.length) {
				const card: CardEntity = cards[outputLeft.length + outputRight.length]
				if (
					modal.leftAreaMax === null ||
					outputLeft.length < modal.leftAreaMax
				) {
					outputLeft.push(card)
				} else if (
					modal.rightAreaMax === null ||
					outputRight.length < modal.rightAreaMax
				) {
					outputRight.push(card)
				}
			}

			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: true,
					leftCards: outputLeft,
					rightCards: outputRight,
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
			yield getNextTurnAction(game, component)
		}
	},
}
