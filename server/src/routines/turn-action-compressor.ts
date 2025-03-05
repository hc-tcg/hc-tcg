import assert from 'assert'
import {cancel, delay, put, spawn} from 'typed-redux-saga'
import {
	BoardSlotComponent,
	CardComponent,
	SlotComponent,
} from '../../../common/components'
import query from '../../../common/components/query'
import {CardEntity, PlayerEntity} from '../../../common/entities'
import {GameModel} from '../../../common/models/game-model'
import {SlotTypeT} from '../../../common/types/cards'
import {
	Message,
	PlayCardAction,
	TurnAction,
} from '../../../common/types/game-state'
import {
	LocalCopyAttack,
	LocalDragCards,
	LocalSelectCards,
	WithoutFunctions,
} from '../../../common/types/server-requests'
import {
	AnyTurnActionData,
	ChangeActiveHermitActionData,
	ForfeitAction,
	ModalResult,
	PickSlotActionData,
	PlayCardActionData,
	WaitActionData,
} from '../../../common/types/turn-action-data'
import {PlayerSetupDefs} from '../../../common/utils/state-gen'
import {GameController, GameControllerProps} from '../game-controller'
import {LocalMessage, localMessages} from '../messages'
import gameSaga from './game'

const VARIABLE_BYTE_MAX = 1 // 0xFF
const REPLAY_VERSION = 0x01
const INVALID_REPLAY = 0x00

const SELECT_CARDS_TYPE = 1
const COPY_ATTACK_TYPE = 2
const DRAG_CARDS_TYPE = 3

type ReplayAction = {
	value: number
	bytes: number
	variableBytes?: boolean
	compress: (game: GameModel, turnAction: any) => Buffer | null
	decompress: (game: GameModel, buffer: Buffer) => AnyTurnActionData | null
}

export type ReplayActionData = {
	action: AnyTurnActionData
	player: PlayerEntity
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
function packupBoardSlot(
	game: GameModel,
	slot: BoardSlotComponent | null,
): Buffer {
	if (!slot) return writeUIntToBuffer(0, 1)
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

	const slotRowIndex = slot.row ? slot.row.index << 3 : 0

	return writeUIntToBuffer(
		(slotType << 6) | slotRowIndex | (slotIndex << 1) | (opponentSlot ? 1 : 0),
		1,
	)
}

function unpackBoardSlot(game: GameModel, byte: number): SlotComponent | null {
	const selectedSlotType = (byte & 0b11000000) >> 6
	const selectedSlotRow = (byte & 0b00111000) >> 3
	const selectedSlotIndex = (byte & 0b00000110) >> 1
	const opponentSlot = Boolean(byte & 0b00000001)

	if (selectedSlotType === 0b10) {
		const selectedSlot = game.components.find(
			BoardSlotComponent,
			query.slot.singleUse,
		)
		return selectedSlot
	}

	const selectedSlot = game.components.find(
		BoardSlotComponent,
		query.slot.rowIndex(selectedSlotRow),
		selectedSlotType === 0b00 ? query.slot.hermit : () => true,
		selectedSlotType === 0b01 ? query.slot.attach : () => true,
		selectedSlotType === 0b11 ? query.slot.item : () => true,
		selectedSlotType === 0b11
			? query.slot.index(selectedSlotIndex)
			: () => true,
		opponentSlot ? query.slot.opponent : query.slot.currentPlayer,
	)

	return selectedSlot
}

/**Returns two bytes representing a card's position anywhere. */
function packupSlotPosition(game: GameModel, slot: SlotComponent): Buffer {
	if (!slot) return writeUIntToBuffer(0, 1)
	function getSlotType(slot: SlotComponent) {
		if (slot.onBoard()) return 0b0001
		if (slot.inHand() && slot.player) return 0b0000
		if (slot.inHand() && slot.opponentPlayer) return 0b1000
		if (slot.inDeck() && slot.player) return 0b0010
		if (slot.inDeck() && slot.opponentPlayer) return 0b1010
		return 0
	}

	const boardSlotPosition = slot.onBoard()
		? packupBoardSlot(game, slot).readUInt8()
		: 0

	const targetPlayer =
		getSlotType(slot) >> 3 === 1 ? game.opponentPlayer : game.currentPlayer

	const handPosition = slot.inHand()
		? targetPlayer.getHand().findIndex((c) => c.slotEntity === slot.entity)
		: 0
	const deckPosition = slot.inDeck()
		? targetPlayer.getDeck().findIndex((c) => c.slotEntity === slot.entity)
		: 0

	const finalBuffer = Buffer.concat([
		writeUIntToBuffer(getSlotType(slot), 1),
		writeUIntToBuffer(boardSlotPosition | handPosition | deckPosition, 1),
	])
	return finalBuffer
}

function unpackSlotPosition(
	game: GameModel,
	bytes: number,
): SlotComponent | null {
	const slotType = (bytes & 0xff00) >> 8
	const position = bytes & 0x00ff

	const onBoard = (slotType & 0x01) === 1
	const inDeck = (slotType & 0x02) >> 1 === 1
	const opponentCard = (slotType & 0x08) >> 3 === 1

	if (onBoard) return unpackBoardSlot(game, position)

	const targetPlayer = opponentCard ? game.opponentPlayer : game.currentPlayer

	const selectedCard = inDeck
		? targetPlayer.getDeck()[position]
		: targetPlayer.getHand()[position]

	return selectedCard.slot
}

const playCard: ReplayAction = {
	value: 0x0,
	// Byte 1: `00` Type `000` Row `00` Index `0` Player
	// Byte 2: Hand position
	bytes: 2,
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
				prizeCard: selectedCard.prizeCard,
			},
		}
	},
}

export const replayActions: Record<TurnAction, ReplayAction> = {
	PLAY_HERMIT_CARD: {
		...playCard,
		value: 0x00,
	},
	PLAY_ITEM_CARD: {
		...playCard,
		value: 0x01,
	},
	PLAY_EFFECT_CARD: {
		...playCard,
		value: 0x02,
	},
	PLAY_SINGLE_USE_CARD: {
		...playCard,
		value: 0x03,
	},
	SINGLE_USE_ATTACK: {
		value: 0x04,
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
		value: 0x05,
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
		value: 0x06,
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
		value: 0x07,
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
		value: 0x08,
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
		value: 0x09,
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
		value: 0x0a,
		bytes: 1,
		compress(game, turnAction: ChangeActiveHermitActionData) {
			const slot = game.components.find(
				SlotComponent,
				query.slot.currentPlayer,
				query.slot.entity(turnAction.entity),
			)
			if (!slot?.inRow()) return null
			return writeUIntToBuffer(slot.row.index, 1)
		},
		decompress(game, buffer) {
			const rowIndex = buffer.readUInt8(0)
			const slotComponent = game.components.find(
				SlotComponent,
				query.slot.hermit,
				query.slot.currentPlayer,
				query.slot.rowIndex(rowIndex),
			)

			if (!slotComponent) return null
			return {
				type: 'CHANGE_ACTIVE_HERMIT',
				entity: slotComponent.entity,
			}
		},
	},
	PICK_REQUEST: {
		value: 0x0b,
		bytes: 2,
		compress(game, turnAction: PickSlotActionData) {
			const slot = game.components.find(
				SlotComponent,
				query.slot.entity(turnAction.entity),
			)
			assert(slot, 'An invalid slot entity was given')
			return packupSlotPosition(game, slot)
		},
		decompress(game, buffer) {
			const slot = unpackSlotPosition(game, buffer.readInt16BE())
			if (!slot) return null
			return {
				type: 'PICK_REQUEST',
				entity: slot.entity,
			}
		},
	},
	MODAL_REQUEST: {
		value: 0x0c,
		bytes: 0,
		variableBytes: true,
		compress(game, turnAction: ModalResult) {
			function compressSelectCards(result: LocalSelectCards.Result) {
				const buffer = Buffer.concat([
					// Type
					writeUIntToBuffer(SELECT_CARDS_TYPE, 1),
					// Result
					writeBoolToBuffer(result.result),
				])

				if (result.cards) {
					// Selected cards
					return Buffer.concat([
						buffer,
						...result.cards.map((card) => {
							const component = game.components.find(
								CardComponent,
								query.card.entity(card),
							)
							assert(component, 'An invalid card entity was given')
							return packupSlotPosition(game, component.slot)
						}),
					])
				}
				return buffer
			}
			function compressCopyAttack(result: LocalCopyAttack.Result) {
				return Buffer.concat([
					// Type
					writeUIntToBuffer(COPY_ATTACK_TYPE, 1),
					// Result
					writeUIntToBuffer(
						result.cancel === true ? 0 : result.pick === 'primary' ? 1 : 2,
						1,
					),
				])
			}
			function compressDragCards(result: LocalDragCards.Result) {
				let buffer = Buffer.concat([
					// Type
					writeUIntToBuffer(DRAG_CARDS_TYPE, 1),
					// Result
					// First bit - result
					// Last 7 bits - length of leftCards (Can never possibly go above 84/0x54)
					writeUIntToBuffer(
						(result.result === true ? 0x80 : 0) +
							(result.leftCards ? result.leftCards.length : 0),
						1,
					),
				])

				if (result.leftCards) {
					// Selected cards
					buffer = Buffer.concat([
						buffer,
						...result.leftCards.map((card) => {
							const component = game.components.find(
								CardComponent,
								query.card.entity(card),
							)
							assert(component, 'An invalid card entity was given')
							return packupSlotPosition(game, component.slot)
						}),
					])
				}

				if (result.rightCards) {
					// Selected cards
					buffer = Buffer.concat([
						buffer,
						...result.rightCards.map((card) => {
							const component = game.components.find(
								CardComponent,
								query.card.entity(card),
							)
							assert(component, 'An invalid card entity was given')
							return packupSlotPosition(game, component.slot)
						}),
					])
				}

				return buffer
			}

			if ('cards' in turnAction.modalResult)
				return compressSelectCards(turnAction.modalResult)
			if ('pick' in turnAction.modalResult)
				return compressCopyAttack(turnAction.modalResult)
			if ('leftCards' in turnAction.modalResult)
				return compressDragCards(turnAction.modalResult)
			else throw Error('Invalid modal type was given')
		},
		decompress(game, buffer): ModalResult {
			function bufferToCards(cardsBuffer: Buffer) {
				const cardEntities: Array<CardEntity> = []
				for (let cursor = 0; cursor < cardsBuffer.length; cursor += 2) {
					const slot = unpackSlotPosition(game, cardsBuffer.readInt16BE(cursor))
					const card = slot?.card
					if (!slot || !card) throw Error('Invalid slot position was given')
					cardEntities.push(card.entity)
				}
				return cardEntities
			}

			function decompressSelectCards(buffer: Buffer): ModalResult {
				const result = buffer.readUInt8(1)
				const cards = bufferToCards(buffer.subarray(2, buffer.length))

				if (!result) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							result: false,
							cards: null,
						},
					}
				}

				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						cards: cards,
						result: true,
					},
				}
			}

			function decompressCopyAttack(buffer: Buffer): ModalResult {
				const result = buffer.readUInt8(1)

				if (result === 0) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							cancel: true,
						},
					}
				}

				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						pick: result === 1 ? 'primary' : 'secondary',
					},
				}
			}

			function decompressDragCards(buffer: Buffer): ModalResult {
				const result = buffer.readUInt8(1) >> 7

				const leftCardLength = result & 0x7f

				const leftCards = bufferToCards(
					buffer.subarray(2, 2 + leftCardLength * 2),
				)
				const rightCards = bufferToCards(
					buffer.subarray(2 + leftCardLength * 2, buffer.length),
				)

				if (!result) {
					return {
						type: 'MODAL_REQUEST',
						modalResult: {
							result: false,
							leftCards: null,
							rightCards: null,
						},
					}
				}

				return {
					type: 'MODAL_REQUEST',
					modalResult: {
						result: true,
						leftCards,
						rightCards,
					},
				}
			}

			const type = buffer.readUInt8(0) as
				| typeof SELECT_CARDS_TYPE
				| typeof DRAG_CARDS_TYPE
				| typeof COPY_ATTACK_TYPE
			switch (type) {
				case SELECT_CARDS_TYPE:
					return decompressSelectCards(buffer)
				case DRAG_CARDS_TYPE:
					return decompressDragCards(buffer)
				case COPY_ATTACK_TYPE:
					return decompressCopyAttack(buffer)
			}
		},
	},
	WAIT_FOR_TURN: {
		value: 0x0d,
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
		value: 0x0e,
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
		value: 0x0f,
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
		value: 0x10,
		bytes: 2,
		compress(game, turnAction: ForfeitAction) {
			if (game.currentPlayer.entity === turnAction.player)
				return writeUIntToBuffer(0, 1)
			return writeUIntToBuffer(1, 1)
		},
		decompress(game, buffer) {
			return {
				type: 'FORFEIT',
				player:
					buffer.readUInt8(0) === 0
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
	player: PlayerEntity,
	millisecondsSinceLastAction: number,
) {
	const argumentsBuffer = replayActions[action.type].compress(game, action)

	const tenthsSinceLastAction = Math.floor(millisecondsSinceLastAction / 100)
	const timeLength = tenthsSinceLastAction > 255 ? 2 : 1

	const timeBuffer = writeUIntToBuffer(tenthsSinceLastAction, timeLength)

	const actionByOtherPlayer = player === game.currentPlayerEntity ? 0 : 1
	const headerBuffer = writeUIntToBuffer(
		0b10000000 * (timeLength - 1) +
			0b01000000 * actionByOtherPlayer +
			replayActions[action.type].value,
		1,
	)

	if (argumentsBuffer) {
		if (replayActions[action.type].variableBytes) {
			const lengthBuffer = writeUIntToBuffer(
				argumentsBuffer.length,
				VARIABLE_BYTE_MAX,
			)
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
): Generator<any, Buffer> {
	const originalGame = controller.game as GameModel

	const firstPlayerSetupDefs: PlayerSetupDefs = controller.player1Defs

	const secondPlayerSetupDefs: PlayerSetupDefs = controller.player2Defs

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

	try {
		newGameController.task = yield* spawn(gameSaga, newGameController)

		for (let i = 0; i < originalGame.turnActions.length; i++) {
			const action = originalGame.turnActions[i]
			buffers.push(
				turnActionToBuffer(
					newGame,
					action.action,
					action.player,
					action.millisecondsSinceLastAction,
				),
			)
			yield* put<LocalMessage>({
				type: localMessages.GAME_TURN_ACTION,
				playerEntity: action.player,
				action: action.action,
			})
		}
	} catch (e) {
		console.error(e)
		Buffer.from([INVALID_REPLAY])
	}

	yield* cancel(newGameController.task)

	return Buffer.concat([Buffer.from([REPLAY_VERSION]), ...buffers])
}

export function* bufferToTurnActions(
	firstPlayerSetupDefs: PlayerSetupDefs,
	secondPlayerSetupDefs: PlayerSetupDefs,
	seed: string,
	props: GameControllerProps,
	actionsBuffer: Buffer,
): Generator<
	any,
	{
		replay: Array<ReplayActionData>
		battleLog: Array<Message>
	}
> {
	const con = new GameController(firstPlayerSetupDefs, secondPlayerSetupDefs, {
		...props,
		randomSeed: seed,
		randomizeOrder: true,
	})
	con.task = yield* spawn(gameSaga, con)

	let cursor = 0

	const version = actionsBuffer.readUInt8(cursor)
	cursor++

	if (version === 0x00 || version === 0x30)
		return {
			replay: [],
			battleLog: [],
		}

	//Other version checks here

	const replayActions: Array<ReplayActionData> = []
	while (cursor < actionsBuffer.length) {
		const actionBufferFullInt = actionsBuffer.readUInt8(cursor)
		const actionNumber = actionBufferFullInt & 0b00111111
		const timeFormat = (actionBufferFullInt & 0b10000000) >> 7
		const actionByOtherPlayer = (actionBufferFullInt & 0b01000000) >> 6
		const action = replayActionsFromValues[actionNumber]
		const actionPlayer = actionByOtherPlayer
			? con.game.opponentPlayerEntity
			: con.game.currentPlayerEntity
		cursor++
		let tenthsSinceLastAction =
			timeFormat === 1
				? actionsBuffer.readUInt16BE(cursor)
				: actionsBuffer.readUInt8(cursor)
		cursor += 1 + timeFormat
		let turnAction: AnyTurnActionData | null = null

		if (!action.variableBytes) {
			const bytes = actionsBuffer.subarray(cursor, cursor + action.bytes)
			cursor += action.bytes
			turnAction = action.decompress(con.game, bytes)
			assert(
				turnAction,
				'There was an error and the data given for the turn action was invalid.',
			)
			replayActions.push({
				action: turnAction,
				player: actionPlayer,
				millisecondsSinceLastAction: tenthsSinceLastAction * 100,
			})
		} else {
			const byteAmount = actionsBuffer.readUInt8(cursor)
			cursor += VARIABLE_BYTE_MAX
			const bytes = actionsBuffer.subarray(cursor, cursor + byteAmount)
			cursor += byteAmount
			turnAction = action.decompress(con.game, bytes)
			assert(
				turnAction,
				'There was an error and the data given for the turn action was invalid.',
			)
			replayActions.push({
				action: turnAction,
				player: actionPlayer,
				millisecondsSinceLastAction: tenthsSinceLastAction * 100,
			})
		}

		yield* put<LocalMessage>({
			type: localMessages.GAME_TURN_ACTION,
			playerEntity: con.game.currentPlayer.entity,
			action: turnAction,
		})

		// I don't know why this works, but we're going with it
		if (turnAction.type === 'END_TURN') {
			yield* delay(1)
		}
	}

	return {
		replay: replayActions,
		battleLog: con.chat,
	}
}
