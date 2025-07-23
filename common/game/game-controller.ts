import {PlayerComponent} from '../components'
import {AIComponent} from '../components/ai-component'
import {PlayerEntity} from '../entities'
import {
	GameModel,
	GameSettings,
	gameSettingsFromEnv,
} from '../models/game-model'
import {PlayerModel} from '../models/player-model'
import {CurrentCoinFlip, Message} from '../types/game-state'
import {TurnActionAndPlayer} from './run-game'
import {PlayerSetupDefs} from './setup-game'
import {AI_DEFINITIONS} from './virtual'

export type GameControllerProps = {
	gameCode?: string
	spectatorCode?: string
	apiSecret?: string
	randomizeOrder?: boolean
	randomSeed?: any
	settings?: GameSettings
	countAchievements?: 'none' | 'all' | 'boss'
	gameId?: string
}

type GameViewerProps = {
	spectator: boolean
	replayer: boolean
	playerOnLeft: PlayerEntity
	player?: PlayerModel
}

export class GameViewer {
	id: string
	game: GameModel
	spectator: boolean
	playerOnLeftEntity: PlayerEntity
	replayer: boolean

	public constructor(game: GameModel, props: GameViewerProps) {
		console.log(props)
		this.id = `${Math.random()}`
		this.game = game
		this.spectator = props.spectator
		this.playerOnLeftEntity = props.playerOnLeft
		this.replayer = props.replayer
	}

	get playerOnLeft() {
		return this.game.components.getOrError(this.playerOnLeftEntity)
	}

	get playerOnRight() {
		return this.playerOnLeft.opponentPlayer
	}
}

/** An object that contains the HC TCG game and infromation related to the game, such as chat messages */
export class GameController {
	createdTime: number
	id: string
	gameCode: string | null
	spectatorCode: string | null
	apiSecret: string | null
	game: GameModel
	chat: Array<Message>
	task: Promise<any> | null
	viewers: Array<GameViewer>
	playerOne: PlayerComponent
	playerTwo: PlayerComponent

	readonly props: GameControllerProps
	readonly player1Defs: PlayerSetupDefs
	readonly player2Defs: PlayerSetupDefs

	private turnActionListener: ((turnAction: TurnActionAndPlayer) => any) | null
	private waitingForTurnActionList: Array<() => any>

	constructor(
		player1: PlayerSetupDefs,
		player2: PlayerSetupDefs,
		props: GameControllerProps,
	) {
		this.chat = []
		this.props = props

		let randomSeed = props.randomSeed || GameModel.newGameSeed()
		this.props.randomSeed = randomSeed

		this.game = new GameModel(
			randomSeed,
			player1,
			player2,
			props.settings || gameSettingsFromEnv(),
			{
				publishBattleLog: (logs, timeout) =>
					this.publishBattleLog(logs, timeout),
				randomizeOrder: props.randomizeOrder ?? true,
				id: props.gameId,
			},
		id)

		this.props.gameId = this.game.id

		this.createdTime = Date.now()
		this.id = 'game-controller_' + Math.random().toString()
		this.gameCode = props.gameCode || null
		this.spectatorCode = props.spectatorCode || null
		this.apiSecret = props.apiSecret || null
		this.task = null
		this.viewers = []

		this.waitingForTurnActionList = []
		this.turnActionListener = null

		this.player1Defs = {
			model: {
				uuid: player1.model.uuid,
				name: player1.model.name,
				minecraftName: player1.model.minecraftName,
				censoredName: player1.model.censoredName,
				appearance: player1.model.appearance,
				disableDeckingOut: player1.model.disableDeckingOut,
			},
			deck: player1.deck,
			score: player1.score,
		}
		this.player2Defs = {
			model: {
				uuid: player2.model.uuid,
				name: player2.model.name,
				minecraftName: player2.model.minecraftName,
				censoredName: player2.model.censoredName,
				appearance: player2.model.appearance,
				disableDeckingOut: player2.model.disableDeckingOut,
			},
			deck: player2.deck,
			score: player2.score,
			ai: player2.ai,
		}

		this.playerOne = this.game.arePlayersSwapped
			? this.game.currentPlayer
			: this.game.opponentPlayer
		this.playerTwo = this.game.arePlayersSwapped
			? this.game.opponentPlayer
			: this.game.currentPlayer

		if (this.player2Defs.ai) {
			const component = this.game.components.new(
				AIComponent,
				this.game.currentPlayer.entity,
				AI_DEFINITIONS[this.player2Defs.ai],
			)
			component.ai.setup(this.game)
		}
	}

	public addViewer(viewer: GameViewerProps) {
		let v = new GameViewer(this.game, viewer)
		this.viewers.push(v)
		return v
	}

	public removeViewer(viewer: GameViewer) {
		this.viewers = this.viewers.filter((v) => v.id !== viewer.id)
	}

	/* Wait until the game is ready to accept a turn action then send one */
	public async sendTurnAction(action: TurnActionAndPlayer) {
		await this.waitForTurnActionReady()
		if (this.turnActionListener) {
			await this.turnActionListener(action)
			this.turnActionListener = null
		}
		await this.waitForTurnActionReady()
	}

	public async waitForTurnAction(): Promise<TurnActionAndPlayer> {
		for (const w of this.waitingForTurnActionList) {
			w()
		}
		this.waitingForTurnActionList = []

		const promise: Promise<TurnActionAndPlayer> = (await new Promise(
			(resolve) => {
				this.turnActionListener = (turnAction) => {
					resolve(turnAction)
				}
			},
		)) as any

		return promise
	}

	public stopWaitingForAction() {
		this.turnActionListener = null
	}

	// Wait until the game is ready to accept a turn action. This is used in unit tests to make sure all actions are
	// processed before sending a new one.
	public async waitForTurnActionReady() {
		if (this.turnActionListener) return
		return await new Promise((resolve) => {
			this.waitingForTurnActionList.push(() => {
				resolve(null)
			})
		})
	}

	public async publishBattleLog(_logs: Array<Message>, _timeout: number) {}

	public broadcastState() {
		this.game.voiceLineQueue = []
	}

	public getRandomDelayForAI(coinFlips: Array<CurrentCoinFlip>) {
		return (
			coinFlips.reduce((r, flip) => r + flip.delay, 0) +
			(this.game.coinFlipRng() * 500 + 500)
		)
	}
}
