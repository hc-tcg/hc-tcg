import {getGameState} from '../utils/state-gen'
import {PlayerModel} from './player-model'
import {AvailableActionsT, GameState} from '../../common/types/game-state'
import {MessageInfoT} from '../../common/types/chat'

export class GameModel {
	public createdTime: number
	public id: string
	public code: string | null
	public players: Record<string, PlayerModel>
	public task: any
	public state: GameState
	public chat: Array<MessageInfoT>

	public endInfo: {
		deadPlayerIds: Array<string>
		winner: string | null
		outcome: 'timeout' | 'forfeit' | 'tie' | 'player_won' | 'error' | null
		reason: 'hermits' | 'lives' | 'cards' | 'time' | null
	}

	public turnState: {
		availableActions: AvailableActionsT
		opponentAvailableActions: AvailableActionsT
		pastTurnActions: Array<string>
	}

	constructor(player1: PlayerModel, player2: PlayerModel, code: string | null = null) {
		this.createdTime = Date.now()
		this.id = 'game_' + Math.random().toString()
		this.code = code
		this.task = null
		this.chat = []

		this.endInfo = {
			deadPlayerIds: [],
			winner: null,
			outcome: null,
			reason: null,
		}

		this.turnState = {
			availableActions: [],
			opponentAvailableActions: [],
			pastTurnActions: [],
		}

		this.players = {
			[player1.playerId]: player1,
			[player2.playerId]: player2,
		}

		this.state = getGameState(this)
	}

	public get currentPlayerId() {
		return this.state.order[(this.state.turn + 1) % 2]
	}

	public get opponentPlayerId() {
		return this.state.order[this.state.turn % 2]
	}

	public get currentPlayer() {
		return this.state.players[this.currentPlayerId]
	}

	public get opponentPlayer() {
		return this.state.players[this.opponentPlayerId]
	}

	public get activeRow() {
		const player = this.currentPlayer
		return player.board.activeRow !== null ? player.board.rows[player.board.activeRow] : null
	}

	public get opponentActiveRow() {
		const player = this.opponentPlayer
		return player.board.activeRow !== null ? player.board.rows[player.board.activeRow] : null
	}

	public getPlayerIds() {
		return Object.keys(this.players)
	}

	public getPlayers() {
		return Object.values(this.players)
	}
}
