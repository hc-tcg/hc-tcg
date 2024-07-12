import type {Attach, CardProps, HasHealth} from '../cards/base/types'
import type {BattleLogModel} from '../models/battle-log-model'
import type {FormattedTextNode} from '../utils/formatting'
import type {HermitAttackType} from './attack'
import type {
	LocalCardInstance,
	LocalStatusEffectInstance,
	ModalData,
	ModalRequest,
	PickInfo,
	PickRequest,
} from './server-requests'
import type {CardComponent} from '../components'
import { PlayerId } from '../models/player-model'

export type Entity = string & {__instance_id: never}
export type PlayerEntity = Entity & {__player_id: never}
export type SlotEntity = Entity & {__slot_id: never}
export type RowEntity = Entity & {__row_id: never}
export type CardEntity = Entity & {__card_id: never}
export type StatusEffectEntity = Entity & {__status_effect_id: never}

export function newEntity(entityName: string): Entity {
	return (entityName + '-' + Math.random().toString()) as Entity
}

export type LocalRowState = {
	entity: RowEntity
	hermit: {slot: SlotEntity; card: LocalCardInstance<HasHealth> | null}
	attach: {slot: SlotEntity; card: LocalCardInstance<Attach> | null}
	items: Array<{slot: SlotEntity; card: LocalCardInstance<CardProps> | null}>
	health: number | null
}

export type CoinFlipT = 'heads' | 'tails'

export type CurrentCoinFlipT = {
	card: CardComponent
	opponentFlip: boolean
	name: string
	tosses: Array<CoinFlipT>
	amount: number
	delay: number
}

export type BattleLogT = {
	player: PlayerEntity
	description: string
}

export type GenericActionResult =
	| 'SUCCESS'
	| 'FAILURE_INVALID_DATA'
	| 'FAILURE_NOT_APPLICABLE'
	| 'FAILURE_ACTION_NOT_AVAILABLE'
	| 'FAILURE_CANNOT_COMPLETE'
	| 'FAILURE_UNKNOWN_ERROR'

export type PlayCardActionResult =
	| 'FAILURE_INVALID_PLAYER'
	| 'FAILURE_INVALID_SLOT'
	| 'FAILURE_UNMET_CONDITION'
	| 'FAILURE_UNMET_CONDITION_SILENT'

export type PickCardActionResult =
	| 'FAILURE_INVALID_PLAYER'
	| 'FAILURE_INVALID_SLOT'
	| 'FAILURE_WRONG_PICK'

export type ActionResult = GenericActionResult | PlayCardActionResult | PickCardActionResult

export type {ModalData} from './server-requests'

export type TurnState = {
	turnNumber: number
	currentPlayerEntity: string
	availableActions: TurnActions
	opponentAvailableActions: TurnActions
	completedActions: TurnActions
	/** Map of source id of the block, to the actual blocked action */
	blockedActions: Record<string, TurnActions>

	currentAttack: HermitAttackType | null
}

export type LocalTurnState = {
	turnNumber: number
	currentPlayerId: string
	availableActions: TurnActions
}

export type GameState = {
	turn: TurnState
	order: Array<PlayerEntity>

	pickRequests: Array<PickRequest>
	modalRequests: Array<ModalRequest>

	lastActionResult: {
		action: TurnAction
		result: ActionResult
	} | null

	timer: {
		turnStartTime: number
		turnRemaining: number
		opponentActionStartTime: number | null
	}
}

export type PlayCardAction =
	| 'PLAY_HERMIT_CARD'
	| 'PLAY_ITEM_CARD'
	| 'PLAY_SINGLE_USE_CARD'
	| 'PLAY_EFFECT_CARD'

export type AttackAction = 'SINGLE_USE_ATTACK' | 'PRIMARY_ATTACK' | 'SECONDARY_ATTACK'

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

export type GameRules = {
	disableTimer: boolean
}

export type TurnActions = Array<TurnAction>

export type GameEndOutcomeT =
	| 'client_crash'
	| 'server_crash'
	| 'timeout'
	| 'forfeit_win'
	| 'forfeit_loss'
	| 'leave_win'
	| 'leave_loss'
	| 'tie'
	| 'unknown'
	| 'you_won'
	| 'you_lost'
	| null

export type GameEndReasonT = 'hermits' | 'lives' | 'cards' | 'time' | null

export type LocalPlayerState = {
	id: PlayerEntity
	playerName: string
	minecraftName: string
	censoredPlayerName: string
	coinFlips: Array<CurrentCoinFlipT>
	lives: number
	board: {
		activeRow: RowEntity | null
		singleUseCard: LocalCardInstance | null
		singleUseCardUsed: boolean
		rows: Array<LocalRowState>
	}
}

export type LocalGameState = {
	turn: LocalTurnState
	order: Array<PlayerEntity>
	statusEffects: Array<LocalStatusEffectInstance>

	// personal data
	hand: Array<LocalCardInstance>
	pileCount: number
	discarded: Array<LocalCardInstance>

	// ids
	playerId: PlayerId
	opponentPlayerId: PlayerId

	lastActionResult: {
		action: TurnAction
		result: ActionResult
	} | null

	currentCardsCanBePlacedIn: Array<[LocalCardInstance, Array<PickInfo>]> | null
	currentPickableSlots: Array<PickInfo> | null
	currentPickMessage: string | null
	currentModalData: ModalData | null

	players: Record<string, LocalPlayerState>

	timer: {
		turnStartTime: number
		turnRemaining: number
	}
}

export type Message = {
	sender: PlayerEntity
	systemMessage: boolean
	message: FormattedTextNode
	createdAt: number
}

// state sent to client
export type LocalGameRoot = {
	localGameState: LocalGameState | null
	time: number

	selectedCard: LocalCardInstance | null
	openedModal: {
		id: string
		info: null
	} | null
	endGameOverlay: {
		reason: GameEndReasonT
		outcome: GameEndOutcomeT
	} | null
	chat: Array<Message>
	battleLog: BattleLogModel | null
	currentCoinFlip: CurrentCoinFlipT | null
	opponentConnected: boolean
}

export type GameLog = {
	type: 'public' | 'private'
	startHand1: Array<CardComponent>
	startHand2: Array<CardComponent>
	startTimestamp: number
	startDeck: string
}
