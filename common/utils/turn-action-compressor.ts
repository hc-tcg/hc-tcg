import {BoardSlotComponent, CardComponent, SlotComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {SlotTypeT} from '../types/cards'
import {PlayCardAction, TurnAction} from '../types/game-state'
import {WithoutFunctions} from '../types/server-requests'
import {
	AnyTurnActionData,
	PlayCardActionData,
	WaitActionData,
	ModalResult,
	PickSlotActionData,
	ChangeActiveHermitActionData,
} from '../types/turn-action-data'

const VARIABLE_BYTE_MAX = 2 // 0xFFFF / 2^16

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

function writeUIntToBuffer(x: number, length: 1 | 2 | 4): Buffer {
	if (length === 1) {
		const bytes = Buffer.alloc(1)
		bytes.writeUInt8(x)
		return bytes
	}
	if (length === 2) {
		const bytes = Buffer.alloc(2)
		bytes.writeUInt16BE(x)
		return bytes
	} else {
		const bytes = Buffer.alloc(4)
		bytes.writeUInt32BE(x)
		return bytes
	}
}

const playCard: ReplayAction = {
	value: 0x0,
	bytes: 2,
	// Byte 1: `00` Type `000` Row `000` Index
	// Byte 2: Hand position
	compress(game, turnAction: PlayCardActionData) {
		const slot = game.components.find(
			BoardSlotComponent,
			query.slot.entity(turnAction.slot),
		)
		if (!slot || !slot.row) return null
		const slotIndex = slot.index ? slot.index : 0

		const cardIndex = game.currentPlayer
			.getHand()
			.findIndex((c) => c.entity === turnAction.card.entity)

		const slotTypeDict: Record<SlotTypeT, number> = {
			hermit: 0b00,
			attach: 0b01,
			single_use: 0b10,
			item: 0b11,
			// These three shouldnt appear when this is used
			hand: 0,
			deck: 0,
			discardPile: 0,
		}

		const slotType = slotTypeDict[slot.type]

		return Buffer.concat([
			writeUIntToBuffer((slotType << 6) | (slot.row.index << 3) | slotIndex, 1),
			writeUIntToBuffer(cardIndex, 1),
		])
	},
	decompress(game, buffer): PlayCardActionData | null {
		const firstByte = buffer.readUInt8(0)
		const selectedSlotRow = (firstByte & 0b11000000) >> 6
		const selectedSlotType = (firstByte & 0b00111000) >> 3
		const selectedSlotIndex = firstByte & 0b00000111
		const selectedCardIndex = buffer.readUInt8(1)

		const selectedSlot = game.components.findEntity(
			BoardSlotComponent,
			query.slot.rowIndex(selectedSlotRow),
			selectedSlotType === 0b00 ? query.slot.hermit : () => true,
			selectedSlotType === 0b01 ? query.slot.attach : () => true,
			selectedSlotType === 0b11 ? query.slot.singleUse : () => true,
			selectedSlotType === 0b10 ? query.slot.item : () => true,
			selectedSlotType === 0b10
				? query.slot.index(selectedSlotIndex)
				: () => true,
		)
		if (!selectedSlot) return null
		const selectedCard = game.currentPlayer.getHand()[selectedCardIndex]
		return {
			type: replayActionsFromValues[this.value].turnAction as PlayCardAction,
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
			return writeUIntToBuffer(slot.row.index, 1)
		},
		decompress(game, buffer) {
			const rowIndex = buffer.readUInt8(0)
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
			return Buffer.concat([
				writeUIntToBuffer(buffer.length, VARIABLE_BYTE_MAX),
				buffer,
			])
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
			return Buffer.concat([
				writeUIntToBuffer(buffer.length, VARIABLE_BYTE_MAX),
				buffer,
			])
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
			return writeUIntToBuffer(turnAction.delay, 4)
		},
		decompress(_game, buffer) {
			return {
				type: 'DELAY',
				delay: buffer.readUInt32BE(0),
			}
		},
	},
}

const replayActionsFromValues = Object.entries(replayActions).reduce(
	(
		all: Record<number, ReplayAction & {turnAction: TurnAction}>,
		[key, action],
	) => {
		all[action.value] = {...action, turnAction: key as TurnAction}
		return all
	},
	{},
)

export function turnActionToBuffer(
	game: GameModel,
	action: AnyTurnActionData,
	millisecondsSinceLastAction: number,
) {
	const argumentsBuffer = replayActions[action.type].compress(game, action)

	const tenthsSinceLastAction = Math.floor(millisecondsSinceLastAction / 100)
	const timeLength = tenthsSinceLastAction > 255 ? 2 : 1

	const timeBuffer = writeUIntToBuffer(tenthsSinceLastAction, timeLength)
	const headerBuffer = writeUIntToBuffer(
		0b10000000 * (timeLength - 1) + replayActions[action.type].value,
		1,
	)

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
		const actionNumber = buffer.readUInt8(cursor) & 0b00111111
		const timeFormat = (buffer.readUInt8(cursor) & 0b10000000) >> 7
		const action = replayActionsFromValues[actionNumber]
		cursor++
		let tenthsSinceLastAction =
			timeFormat === 1 ? buffer.readUInt16BE(cursor) : buffer.readUInt8(cursor)
		cursor += 1 + timeFormat
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
			const byteAmount = buffer.readUInt32BE(cursor)
			cursor += VARIABLE_BYTE_MAX
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
