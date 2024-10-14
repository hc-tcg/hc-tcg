import {BoardSlotComponent, CardComponent, SlotComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {TurnAction} from '../types/game-state'
import {WithoutFunctions} from '../types/server-requests'
import {
	AnyTurnActionData,
	PlayCardActionData,
	WaitActionData,
	ModalResult,
	PickSlotActionData,
	ChangeActiveHermitActionData,
} from '../types/turn-action-data'

type ReplayAction = {
	value: number
	// If bytes is variable, the following 4 bytes are used for length
	bytes: number | 'variable'
	compress: (game: GameModel, turnAction: any) => Buffer | null
	decompress: (game: GameModel, buffer: Buffer) => AnyTurnActionData | null
}

type ReplayActionData = {
	action: AnyTurnActionData
	millisecondsSinceLastAction: number
}

function writeIntToBuffer(x: number, length: 1 | 2 | 4): Buffer {
	if (length === 1) {
		const bytes = Buffer.alloc(1)
		bytes.writeInt8(x)
		return bytes
	}
	if (length === 2) {
		const bytes = Buffer.alloc(2)
		bytes.writeInt16BE(x)
		return bytes
	} else {
		const bytes = Buffer.alloc(4)
		bytes.writeInt32BE(x)
		return bytes
	}
}

function getSlotIndex(slot: SlotComponent): number {
	if (slot.type === 'item' && slot.onBoard() && slot.index) return slot.index
	if (slot.type === 'hermit') return 4
	if (slot.type === 'attach') return 5
	if (slot.type === 'single_use') return 6
	return 15
}

const playCard: ReplayAction = {
	value: 0x0,
	bytes: 4,
	compress(game, turnAction: PlayCardActionData) {
		const slot = game.components.find(
			BoardSlotComponent,
			query.slot.entity(turnAction.slot),
		)
		if (!slot) return null
		const slotRow = slot.row?.index
		if (slotRow === undefined) return null
		const slotColumn = getSlotIndex(slot)

		const cardIndex = game.currentPlayer
			.getHand()
			.findIndex((c) => c.entity === turnAction.card.entity)

		return Buffer.concat([
			writeIntToBuffer(slotRow, 1),
			writeIntToBuffer(slotColumn, 1),
			writeIntToBuffer(cardIndex, 2),
		])
	},
	decompress(game, buffer): PlayCardActionData | null {
		const selectedSlotRow = buffer.readInt8(0)
		const selectedSlotColumn = buffer.readInt8(1)
		const selectedCardIndex = buffer.readInt16BE(2)

		const selectedSlot = game.components.findEntity(
			BoardSlotComponent,
			query.slot.rowIndex(selectedSlotRow),
			selectedSlotColumn < 3
				? query.slot.index(selectedSlotColumn)
				: selectedSlotColumn === 4
					? query.slot.attach
					: selectedSlotColumn === 5
						? query.slot.hermit
						: query.slot.singleUse,
		)
		if (!selectedSlot) return null
		const selectedCard = game.currentPlayer.getHand()[selectedCardIndex]
		return {
			type: 'PLAY_EFFECT_CARD',
			slot: selectedSlot,
			card: {
				props: WithoutFunctions(selectedCard.props),
				entity: selectedCard.entity,
				slot: selectedCard.slotEntity,
				attackHint: null,
				turnedOver: selectedCard.turnedOver,
			},
		}
	},
}

export const replayActions: Record<TurnAction, ReplayAction> = {
	PLAY_HERMIT_CARD: {
		...playCard,
		value: 0x0,
	},
	PLAY_ITEM_CARD: {
		...playCard,
		value: 0x1,
	},
	PLAY_EFFECT_CARD: {
		...playCard,
		value: 0x2,
	},
	PLAY_SINGLE_USE_CARD: {
		...playCard,
		value: 0x3,
	},
	SINGLE_USE_ATTACK: {
		value: 0x4,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'SINGLE_USE_ATTACK',
			}
		},
	},
	PRIMARY_ATTACK: {
		value: 0x5,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'PRIMARY_ATTACK',
			}
		},
	},
	SECONDARY_ATTACK: {
		value: 0x6,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'SECONDARY_ATTACK',
			}
		},
	},
	END_TURN: {
		value: 0x7,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'END_TURN',
			}
		},
	},
	APPLY_EFFECT: {
		value: 0x8,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'APPLY_EFFECT',
			}
		},
	},
	REMOVE_EFFECT: {
		value: 0x9,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'REMOVE_EFFECT',
			}
		},
	},
	CHANGE_ACTIVE_HERMIT: {
		value: 0xa,
		bytes: 1,
		compress(game, turnAction: ChangeActiveHermitActionData) {
			const slot = game.components.find(
				SlotComponent,
				query.slot.entity(turnAction.entity),
			)
			if (!slot?.inRow()) return null
			return writeIntToBuffer(slot.row.index, 1)
		},
		decompress(game, buffer) {
			const rowIndex = buffer.readInt8(0)
			const cardComponent = game.components.find(
				CardComponent,
				query.card.isHermit,
				query.card.row(query.row.index(rowIndex)),
			)
			if (!cardComponent) return null
			return {
				type: 'CHANGE_ACTIVE_HERMIT',
				entity: cardComponent.slot.entity,
			}
		},
	},
	PICK_REQUEST: {
		value: 0xb,
		bytes: 'variable',
		compress(_game, turnAction: PickSlotActionData) {
			const buffer = Buffer.from(turnAction.entity)
			return Buffer.concat([writeIntToBuffer(buffer.length, 4), buffer])
		},
		decompress(_game, buffer) {
			return {
				type: 'PICK_REQUEST',
				entity: buffer.toString('utf-8'),
			}
		},
	},
	MODAL_REQUEST: {
		value: 0xc,
		bytes: 'variable',
		compress(_game, turnAction: ModalResult) {
			const json = JSON.stringify(turnAction.modalResult)
			const buffer = Buffer.from(json)
			return Buffer.concat([writeIntToBuffer(buffer.length, 4), buffer])
		},
		decompress(_game, buffer) {
			return JSON.parse(buffer.toString('utf-8'))
		},
	},
	WAIT_FOR_TURN: {
		value: 0xd,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'WAIT_FOR_TURN',
			}
		},
	},
	WAIT_FOR_OPPONENT_ACTION: {
		value: 0xe,
		bytes: 0,
		compress() {
			return null
		},
		decompress() {
			return {
				type: 'WAIT_FOR_OPPONENT_ACTION',
			}
		},
	},
	DELAY: {
		value: 0xf0,
		bytes: 4,
		compress(_game, turnAction: WaitActionData) {
			return writeIntToBuffer(turnAction.delay, 4)
		},
		decompress(_game, buffer) {
			return {
				type: 'DELAY',
				delay: buffer.readInt32BE(0),
			}
		},
	},
}

const replayActionsFromValues = Object.values(replayActions).reduce(
	(all: Record<number, ReplayAction>, action) => {
		all[action.value] = action
		return all
	},
	{},
)

export function turnActionsToBuffer(
	game: GameModel,
	action: AnyTurnActionData,
	millisecondsSinceLastAction: number,
) {
	const headerBuffer = writeIntToBuffer(replayActions[action.type].value, 1)
	const argumentsBuffer = replayActions[action.type].compress(game, action)

	const tenthsSinceLastAction = Math.floor(millisecondsSinceLastAction / 100)

	function getTimeBuffer(tenths: number, buffer?: Buffer): Buffer {
		if (tenths < 0xff) {
			if (!buffer) return writeIntToBuffer(tenths, 1)
			return Buffer.concat([buffer, writeIntToBuffer(tenths, 1)])
		}
		return getTimeBuffer(tenths - 0xff, writeIntToBuffer(0xff, 1))
	}

	const timeBuffer = getTimeBuffer(tenthsSinceLastAction)

	if (argumentsBuffer) {
		return Buffer.concat([headerBuffer, timeBuffer, argumentsBuffer])
	}
	return Buffer.concat([headerBuffer, timeBuffer])
}

export function bufferToTurnActions(
	game: GameModel,
	buffer: Buffer,
): Array<ReplayActionData> {
	let cursor = 0
	const replayActions: Array<ReplayActionData> = []
	while (cursor < buffer.length) {
		const actionNumber = buffer.readInt8(cursor)
		const action = replayActionsFromValues[actionNumber]
		cursor++
		let tenthsSinceLastAction = buffer.readInt8(cursor)
		cursor++
		while (buffer.readInt8(cursor) === 0xff) {
			cursor++
			tenthsSinceLastAction += buffer.readInt8(cursor)
		}
		if (action.bytes !== 'variable') {
			const bytes = buffer.subarray(cursor, cursor + action.bytes)
			cursor += action.bytes
			const turnAction = action.decompress(game, bytes)
			if (turnAction)
				replayActions.push({
					action: turnAction,
					millisecondsSinceLastAction: tenthsSinceLastAction * 100,
				})
		} else {
			const byteAmount = buffer.readInt32BE(cursor)
			cursor += 4
			const bytes = buffer.subarray(cursor, byteAmount)
			const turnAction = action.decompress(game, bytes)
			if (turnAction)
				replayActions.push({
					action: turnAction,
					millisecondsSinceLastAction: tenthsSinceLastAction * 100,
				})
		}
		// We need to run the action to play the game to the next state here
	}

	return replayActions
}
