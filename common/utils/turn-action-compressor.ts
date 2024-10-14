import {getLocalCard} from '../../server/src/utils/state-gen'
import {BoardSlotComponent, CardComponent, SlotComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {TurnAction} from '../types/game-state'
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
	// If variable the following 4 bytes are used for length
	chunks: number | 'variable' // Each chunk is 8 bits
	compress: (game: GameModel, turnAction: any) => Buffer | null
	decompress: (game: GameModel, chunks: Buffer) => AnyTurnActionData | null
}

function writeIntToBuffer(x: number, length: 8 | 16 | 32): Buffer {
	if (length === 8) {
		const bytes = Buffer.alloc(8)
		bytes.writeInt8(x)
		return bytes
	}
	if (length === 16) {
		const bytes = Buffer.alloc(16)
		bytes.writeInt16BE(x)
		return bytes
	} else {
		const bytes = Buffer.alloc(32)
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
	chunks: 4,
	compress(game, turnAction: PlayCardActionData) {
		const slot = game.components.find(
			BoardSlotComponent,
			query.slot.entity(turnAction.slot),
		)
		if (!slot) return null
		const slotRow = slot.row?.index
		if (!slotRow) return null
		const slotColumn = getSlotIndex(slot)
		const cardIndex = game.currentPlayer
			.getHand()
			.findIndex((c) => c.entity === turnAction.card.entity)

		return Buffer.concat([
			writeIntToBuffer(slotRow, 8),
			writeIntToBuffer(slotColumn, 8),
			writeIntToBuffer(cardIndex, 16),
		])
	},
	decompress(game, buffer): PlayCardActionData | null {
		const selectedSlotRow = buffer.readInt8(0)
		const selectedSlotColumn = buffer.readInt8(8)
		const selectedCardIndex = buffer.readInt16BE(16)

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
			card: getLocalCard(game, selectedCard),
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
		chunks: 0,
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
		chunks: 0,
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
		chunks: 0,
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
		chunks: 0,
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
		chunks: 0,
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
		chunks: 0,
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
		chunks: 1,
		compress(game, turnAction: ChangeActiveHermitActionData) {
			const slot = game.components.find(
				SlotComponent,
				query.slot.entity(turnAction.entity),
			)
			if (!slot?.inRow()) return null
			return writeIntToBuffer(slot.row.index, 8)
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
		chunks: 'variable',
		compress(_game, turnAction: PickSlotActionData) {
			const buffer = Buffer.from(turnAction.entity)
			return Buffer.concat([writeIntToBuffer(buffer.length, 32), buffer])
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
		chunks: 'variable',
		compress(_game, turnAction: ModalResult) {
			const json = JSON.stringify(turnAction.modalResult)
			const buffer = Buffer.from(json)
			return Buffer.concat([writeIntToBuffer(buffer.length, 32), buffer])
		},
		decompress(_game, buffer) {
			return JSON.parse(JSON.stringify(buffer))
		},
	},
	WAIT_FOR_TURN: {
		value: 0xd,
		chunks: 0,
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
		chunks: 0,
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
		chunks: 4,
		compress(_game, turnAction: WaitActionData) {
			return writeIntToBuffer(turnAction.delay, 32)
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
	turnActions: Array<AnyTurnActionData>,
) {
	const buffers = turnActions.reduce((r: Array<Buffer>, action) => {
		const buffer = replayActions[action.type].compress(game, action)
		if (buffer) r.push(buffer)
		return r
	}, [])
	return Buffer.concat(buffers)
}

export function bufferToTurnActions(
	game: GameModel,
	buffer: Buffer,
): Array<AnyTurnActionData> {
	let i = 0
	const turnActions: Array<AnyTurnActionData> = []
	while (i < buffer.length) {
		const actionNumber = buffer.readInt8(i)
		const action = replayActionsFromValues[actionNumber]
		i++
		if (action.chunks !== 'variable') {
			const chunks = buffer.subarray(i, i + action.chunks * 8)
			i += action.chunks * 8
			const turnAction = action.decompress(game, chunks)
			if (turnAction) turnActions.push(turnAction)
		} else {
			const byteAmount = buffer.readInt32BE(i)
			i += 4
			const chunks = buffer.subarray(i, byteAmount)
			const turnAction = action.decompress(game, chunks)
			if (turnAction) turnActions.push(turnAction)
		}
	}

	return turnActions
}
