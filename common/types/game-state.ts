import type {Attach, Card, HasHealth} from '../cards/types'
import {COINS} from '../coins'
import type {CardComponent} from '../components'
import type {CardEntity, PlayerEntity, RowEntity, SlotEntity} from '../entities'
import type {PlayerId} from '../models/player-model'
import type {FormattedTextNode} from '../utils/formatting'
import type {HermitAttackType} from './attack'
import {ModalRequest} from './modal-requests'
import type {
	LocalCardInstance,
	LocalModalData,
	LocalStatusEffectInstance,
	PickRequest,
} from './server-requests'

type NewType = SlotEntity

export type LocalRowState = {
	entity: RowEntity
	hermit: {slot: SlotEntity; card: LocalCardInstance<HasHealth> | null}
	attach: {slot: NewType; card: LocalCardInstance<Attach> | null}
	items: Array<{slot: SlotEntity; card: LocalCardInstance<Card> | null}>
	health: number | null
}

export type CoinFlipResult = 'heads' | 'tails'
export type CoinFlip = {
	result: CoinFlipResult
	forced: boolean
}

export type CurrentCoinFlip = {
	card: CardEntity
	opponentFlip: boolean
	name: string
	tosses: Array<CoinFlip>
	amount: number
	delay: number
	headImage: keyof typeof COINS
}

export type LocalCurrentCoinFlip = {
	card: LocalCardInstance
	opponentFlip: boolean
	name: string
	tosses: Array<CoinFlip>
	amount: number
	delay: number
	headImage: keyof typeof COINS
}

export type BattleLogT = {
	player: PlayerEntity
	description: string
}

export type {LocalModalData as ModalData} from './server-requests'

export type TurnState = {
	turnNumber: number
	availableActions: TurnActions
	opponentAvailableActions: TurnActions
	completedActions: TurnActions
	/** Map of source id of the block, to the actual blocked action */
	blockedActions: Record<string, TurnActions>

	currentAttack: HermitAttackType | null
}

export type LocalTurnState = {
	turnNumber: number
	currentPlayerEntity: PlayerEntity
	availableActions: TurnActions
}

export type GameState = {
	turn: TurnState
	order: Array<PlayerEntity>

	pickRequests: Array<PickRequest>
	modalRequests: Array<ModalRequest>

	timer: {
		turnStartTime: number
		turnRemaining: number
		opponentActionStartTime: number | null
	}

	isBossGame: boolean
}

export type PlayCardAction =
	| 'PLAY_HERMIT_CARD'
	| 'PLAY_ITEM_CARD'
	| 'PLAY_SINGLE_USE_CARD'
	| 'PLAY_EFFECT_CARD'

export type AttackAction =
	| 'SINGLE_USE_ATTACK'
	| 'PRIMARY_ATTACK'
	| 'SECONDARY_ATTACK'

export type TurnAction =
	| PlayCardAction
	| AttackAction
	| 'END_TURN'
	| 'APPLY_EFFECT'
	| 'REMOVE_EFFECT'
	| 'CHANGE_ACTIVE_HERMIT'
	| 'PICK_REQUEST'
	| 'MODAL_REQUEST'
	| 'WAIT_FOR_TURN'
	| 'WAIT_FOR_OPPONENT_ACTION'
	| 'DELAY'
	| 'FORFEIT'

export type GameRules = {
	disableTimer: boolean
}

export type TurnActions = Array<TurnAction>

export type GameOutcome =
	| {type: 'tie'}
	| {type: 'timeout'}
	| {type: 'game-crash'; error: string}
	| {
			type: 'player-won'
			winner: PlayerEntity
			victoryReason: GameVictoryReason
	  }

export type GameVictoryReason =
	| 'forfeit'
	| 'no-hermits-on-board'
	| 'timeout-without-hermits'
	| 'decked-out'
	| 'lives'

export type LocalPlayerState = {
	entity: PlayerEntity
	playerId?: PlayerId
	playerName: string
	minecraftName: string
	censoredPlayerName: string
	coinFlips: Array<LocalCurrentCoinFlip>
	lives: number
	board: {
		activeRow: RowEntity | null
		singleUse: {slot: SlotEntity; card: LocalCardInstance | null}
		singleUseCardUsed: boolean
		rows: Array<LocalRowState>
	}
}

export type LocalGameState = {
	isSpectator: boolean
	turn: LocalTurnState
	order: Array<PlayerEntity>

	statusEffects: Array<LocalStatusEffectInstance>

	// personal data
	hand: Array<LocalCardInstance>
	pileCount: number
	discarded: Array<LocalCardInstance>

	// ids
	playerEntity: PlayerEntity
	opponentPlayerEntity: PlayerEntity

	currentCardsCanBePlacedIn: Array<
		[LocalCardInstance, Array<SlotEntity>]
	> | null
	currentPickableSlots: Array<SlotEntity> | null
	currentPickMessage: string | null
	currentModalData: LocalModalData | null

	players: Record<PlayerEntity, LocalPlayerState>

	timer: {
		turnStartTime: number
		turnRemaining: number
	}

	isBossGame: boolean

	voiceLineQueue: Array<string>
}

type MessageSender =
	| {
			type: 'viewer'
			id: PlayerId
	  }
	| {
			type: 'system'
			id: PlayerEntity
	  }

export type Message = {
	sender: MessageSender
	message: FormattedTextNode
	createdAt: number
}

export type GameLog = {
	type: 'public' | 'private'
	startHand1: Array<CardComponent>
	startHand2: Array<CardComponent>
	startTimestamp: number
	startDeck: string
}

export type UsedHermitAttackInfo = {
	readonly attackType: 'primary' | 'secondary'
	readonly attacker: CardComponent
	readonly turn: number
}

export abstract class DefaultDictionary<Keys, Type> {
	default: () => Type
	values: Record<string, Type> = {}

	public constructor(defaultFactory: () => Type) {
		this.default = defaultFactory
	}

	public abstract set(key: Keys, value: Type): void
	protected setValue(stringKey: string, value: Type) {
		this.values[stringKey] = value
	}

	public abstract get(key: Keys): Type
	protected getValue(stringKey: string) {
		if (stringKey in this.values) {
			return this.values[stringKey]
		}
		return this.default()
	}

	public abstract clear(key: Keys): void
	protected clearValue(stringKey: string) {
		delete this.values[stringKey]
	}
}
