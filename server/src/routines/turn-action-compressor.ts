import {GameController} from '../game-controller'
import {
	BoardSlotComponent,
	CardComponent,
	SlotComponent,
} from '../../../common/components'
import query from '../../../common/components/query'
import {CardEntity} from '../../../common/entities'
import {GameModel} from '../../../common/models/game-model'
import {PlayerModel} from '../../../common/models/player-model'
import {SlotTypeT} from '../../../common/types/cards'
import {PlayCardAction, TurnAction} from '../../../common/types/game-state'
import {WithoutFunctions} from '../../../common/types/server-requests'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
	ModalResult,
	PickSlotActionData,
	PlayCardActionData,
	WaitActionData,
	ForfeitAction,
} from '../../../common/types/turn-action-data'
import {PlayerSetupDefs} from '../../../common/utils/state-gen'
import gameSaga from './game'
import {put, spawn} from 'typed-redux-saga'
import {LocalMessage, localMessages} from 'messages'

const VARIABLE_BYTE_MAX = 2 // 0xFFFF / 2^16
const REPLAY_VERSION = 0x01

type ReplayAction = {
	value: number
	// If bytes is variable, the following 4 bytes are used for length
	bytes: number | 'variable'
	compress: (game: GameModel, turnAction: any) => Buffer | null
	decompress: (game: GameModel, buffer: Buffer) => AnyTurnActionData | null
}

export type ReplayActionData = {
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

function writeBoolToBuffer(x: boolean): Buffer {
	const bytes = Buffer.alloc(1)
	bytes.writeInt8(Number(x))
	return bytes
}

/**Returns a byte representing a slot's place on the board. */
function packupBoardSlot(game: GameModel, slot: BoardSlotComponent | null) {
	if (!slot || !slot.row) return writeUIntToBuffer(0, 1)
	const slotIndex = slot.index && slot.index <= 3 ? slot.index : 0
	const opponentSlot = slot.player.entity !== game.currentPlayer.entity

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

	return writeUIntToBuffer(
		(slotType << 6) |
			(slot.row.index << 3) |
			(slotIndex << 1) |
			(opponentSlot ? 1 : 0),
		1,
	)
}

function unpackBoardSlot(game: GameModel, byte: number): SlotComponent | null {
	const selectedSlotType = (byte & 0b11000000) >> 6
	const selectedSlotRow = (byte & 0b00111000) >> 3
	const selectedSlotIndex = (byte & 0b00000110) >> 1
	const opponentSlot = Boolean(byte & 0b00000001)

	const selectedSlot = game.components.find(
		BoardSlotComponent,
		query.slot.rowIndex(selectedSlotRow),
		selectedSlotType === 0b00 ? query.slot.hermit : () => true,
		selectedSlotType === 0b01 ? query.slot.attach : () => true,
		selectedSlotType === 0b11 ? query.slot.singleUse : () => true,
		selectedSlotType === 0b10 ? query.slot.item : () => true,
		selectedSlotType === 0b10
			? query.slot.index(selectedSlotIndex)
			: () => true,
		opponentSlot ? query.slot.opponent : query.slot.currentPlayer,
	)
	return selectedSlot
}

const playCard: ReplayAction = {
	value: 0x0,
	bytes: 2,
	// Byte 1: `00` Type `000` Row `00` Index `0` Player
	// Byte 2: Hand position
	compress(game, turnAction: PlayCardActionData) {
		const slot = game.components.find(
			BoardSlotComponent,
			query.slot.entity(turnAction.slot),
		)

		const cardIndex = game.currentPlayer
			.getHand()
			.findIndex((c) => c.entity === turnAction.card.entity)

		return Buffer.concat([
			packupBoardSlot(game, slot),
			writeUIntToBuffer(cardIndex, 1),
		])
	},
	decompress(game, buffer): PlayCardActionData | null {
		const selectedSlot = unpackBoardSlot(game, buffer.readUint8(0))?.entity
		if (!selectedSlot) return null
		const selectedCardIndex = buffer.readUInt8(1)
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
	//@TODO Does not support brush modal
	MODAL_REQUEST: {
		value: 0xc,
		bytes: 'variable',
		compress(game, turnAction: ModalResult) {
			if ('result' in turnAction.modalResult) {
				const result = turnAction.modalResult.result

				//@TODO THIS NEEDS TO BE FIXED TO ACTUALLY WORK BEFORE WE BRING BACK ADVENT
				if (!('cards' in turnAction.modalResult)) return null

				const cards = turnAction.modalResult.cards?.map((card): Buffer => {
					const cardComponent = game.components.find(
						CardComponent,
						query.card.entity(card),
					)
					if (!cardComponent) return writeUIntToBuffer(0, 1)
					const slot = cardComponent.slot
					function getSlotType(slot: SlotComponent) {
						if (slot.onBoard()) return 0b0000
						if (slot.inHand() && slot.player) return 0b0001
						if (slot.inHand() && slot.opponentPlayer) return 0b1001
						if (slot.inDeck() && slot.player) return 0b0011
						if (slot.inDeck() && slot.opponentPlayer) return 0b1011
						return 0
					}

					const boardSlotPosition = slot.onBoard()
						? packupBoardSlot(game, slot).readUInt8()
						: 0
					const _handPosition = slot.inHand()
						? game.currentPlayer
								.getHand()
								.findIndex((c) => c.entity === cardComponent.entity)
						: 0
					const _deckPosition = slot.inHand()
						? game.currentPlayer
								.getDeck()
								.findIndex((c) => c.entity === cardComponent.entity)
						: 0

					const finalBuffer = Buffer.concat([
						writeUIntToBuffer(getSlotType(slot), 1),
						writeUIntToBuffer(boardSlotPosition, 1),
					])
					return finalBuffer
				})
				if (!cards) return null
				return Buffer.concat([
					writeUIntToBuffer(0, 1),
					writeBoolToBuffer(result),
					...cards,
				])
			}
			if ('cancel' in turnAction.modalResult) {
				turnAction.modalResult.pick

				let result = 0
				if (turnAction.modalResult.cancel) result = 0
				if (turnAction.modalResult.pick === 'primary') result = 1
				if (turnAction.modalResult.pick === 'secondary') result = 2

				return Buffer.concat([
					writeUIntToBuffer(1, 1),
					writeUIntToBuffer(result, 1),
				])
			}

			return null
		},
		decompress(game, buffer): ModalResult {
			const type = buffer.readUInt8(0)
			if (type === 0) {
				const result = Boolean(buffer.readUInt8(1))
				const cardsBytes = buffer.subarray(2, buffer.length)
				console.log('Card bytes:' + cardsBytes.length)
				const cards: Array<CardEntity> = []
				for (let cursor = 0; cursor < cardsBytes.length; cursor += 2) {
					const slotType = cardsBytes.readInt8(cursor)
					const argument = cardsBytes.readInt8(cursor + 1)
					const opponentSlot = Boolean((slotType & 0b1000) >> 3)

					if ((slotType & 0b0111) === 0) {
						const retrievedCard = unpackBoardSlot(game, argument)?.getCard()
						if (retrievedCard) cards.push(retrievedCard.entity)
					} else if ((slotType & 0b0111) === 1) {
						if (opponentSlot) {
							const retrievedCard = game.opponentPlayer.getHand()[argument]
							cards.push(retrievedCard.entity)
						} else {
							const retrievedCard = game.currentPlayer.getHand()[argument]
							cards.push(retrievedCard.entity)
						}
					} else if ((slotType & 0b0111) === 2) {
						if (opponentSlot) {
							const retrievedCard = game.opponentPlayer.getDeck()[argument]
							cards.push(retrievedCard.entity)
						} else {
							const retrievedCard = game.currentPlayer.getDeck()[argument]
							cards.push(retrievedCard.entity)
						}
					}
				}

				return {
					type: 'MODAL_REQUEST',
					modalResult: result
						? {
								result,
								cards,
							}
						: {result, cards: null},
				}
			}
			if (type == 1) {
				const result = buffer.readUInt8(1)
				if (result === 1) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							pick: 'primary',
						},
					}
				}
				if (result === 2) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							pick: 'secondary',
						},
					}
				}
				if (result === 0) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							cancel: true,
						},
					}
				}
			}
			throw Error('Invalid type when parsing')
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
	FORFEIT: {
		value: 0xf1,
		bytes: 4,
		compress(game, turnAction: ForfeitAction) {
			if (game.currentPlayer.entity === turnAction.player)
				return writeUIntToBuffer(0, 1)
			return writeUIntToBuffer(1, 1)
		},
		decompress(game, _buffer) {
			return {
				type: 'FORFEIT',
				player:
					_buffer.at(0) === 0
						? game.currentPlayer.entity
						: game.opponentPlayer.entity,
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

function turnActionToBuffer(
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
		if (replayActions[action.type].bytes === 'variable') {
			const lengthBuffer = writeUIntToBuffer(argumentsBuffer.length, 2)
			return Buffer.concat([
				headerBuffer,
				timeBuffer,
				lengthBuffer,
				argumentsBuffer,
			])
		}
		return Buffer.concat([headerBuffer, timeBuffer, argumentsBuffer])
	}
	return Buffer.concat([headerBuffer, timeBuffer])
}

export function* turnActionsToBuffer(
	controller: GameController,
): Generator<any, Buffer<ArrayBuffer>> {
	const originalGame = controller.game as GameModel

	const players: Array<PlayerModel> = controller.getPlayers()
	if (!players[0].deck || !players[1].deck) return Buffer.from([0x00])

	const firstPlayerSetupDefs: PlayerSetupDefs = {
		model: players[0],
		deck: players[0].deck.cards.map((card) => card.props.id),
	}

	const secondPlayerSetupDefs: PlayerSetupDefs = {
		model: players[1],
		deck: players[1].deck.cards.map((card) => card.props.id),
	}

	const newGameController = new GameController(
		firstPlayerSetupDefs,
		secondPlayerSetupDefs,
		{
			...controller.props,
			randomSeed: originalGame.rngSeed,
			randomizeOrder: true,
		},
	)

	const newGame: GameModel = newGameController.game

	const buffers: Array<Buffer> = []

	newGameController.task = yield* spawn(gameSaga, newGameController)

	for (let i = 0; i < originalGame.turnActions.length; i++) {
		const action = originalGame.turnActions[i]
		buffers.push(
			turnActionToBuffer(
				newGame,
				action.action,
				action.millisecondsSinceLastAction,
			),
		)
		yield* put<LocalMessage>({
			type: localMessages.GAME_TURN_ACTION,
			playerEntity: newGame.currentPlayer.entity,
			action: action.action,
		})
	}

	return Buffer.concat([Buffer.from([REPLAY_VERSION]), ...buffers])
}

export function bufferToTurnActions(
	firstPlayerSetupDefs: PlayerSetupDefs,
	secondPlayerSetupDefs: PlayerSetupDefs,
	seed: string,
	actionsBuffer: Buffer,
): Array<ReplayActionData> {
	const con = new GameController(firstPlayerSetupDefs, secondPlayerSetupDefs, {
		randomSeed: seed,
		randomizeOrder: true,
	})

	let cursor = 0

	const version = actionsBuffer.readUInt8(cursor)
	cursor++

	if (version === 0x00 || version === 0x30) return []

	//Other version checks here

	const replayActions: Array<ReplayActionData> = []
	while (cursor < actionsBuffer.length) {
		const actionNumber = actionsBuffer.readUInt8(cursor) & 0b00111111
		const timeFormat = (actionsBuffer.readUInt8(cursor) & 0b10000000) >> 7
		const action = replayActionsFromValues[actionNumber]
		cursor++
		let tenthsSinceLastAction =
			timeFormat === 1
				? actionsBuffer.readUInt16BE(cursor)
				: actionsBuffer.readUInt8(cursor)
		cursor += 1 + timeFormat
		if (action.bytes !== 'variable') {
			const bytes = actionsBuffer.subarray(cursor, cursor + action.bytes)
			cursor += action.bytes
			const turnAction = action.decompress(con.game, bytes)
			if (turnAction) {
				replayActions.push({
					action: turnAction,
					millisecondsSinceLastAction: tenthsSinceLastAction * 100,
				})
			}
		} else {
			const byteAmount = actionsBuffer.readUInt16BE(cursor)
			cursor += VARIABLE_BYTE_MAX
			const bytes = actionsBuffer.subarray(cursor, cursor + byteAmount)
			const turnAction = action.decompress(con.game, bytes)
			if (turnAction) {
				replayActions.push({
					action: turnAction,
					millisecondsSinceLastAction: tenthsSinceLastAction * 100,
				})
			}
		}
	}

	return replayActions
}
