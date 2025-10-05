import assert from 'assert'
import {ACHIEVEMENTS_LIST} from '../achievements'
import {
	AchievementComponent,
	ObserverComponent,
	PlayerComponent,
} from '../components'
import {PlayerEntity} from '../entities'
import {
	GameModel,
	GameSettings,
	gameSettingsFromEnv,
} from '../models/game-model'
import {PlayerId, PlayerModel} from '../models/player-model'
import {EarnedAchievement} from '../types/achievements'
import {CurrentCoinFlip, Message} from '../types/game-state'
import {TurnActionAndPlayer} from './run-game'
import {PlayerSetupDefs} from './setup-game'

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
	player: PlayerModel
}

export class GameViewer {
	id: string
	game: GameModel
	spectator: boolean
	playerOnLeftEntity: PlayerEntity
	player: PlayerModel
	replayer: boolean

	public constructor(game: GameModel, props: GameViewerProps) {
		this.id = `${Math.random()}`
		this.game = game
		this.spectator = props.spectator
		this.playerOnLeftEntity = props.playerOnLeft
		this.player = props.player
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

		this.game = new GameModel(
			props.randomSeed || GameModel.newGameSeed(),
			player1,
			player2,
			props.settings || gameSettingsFromEnv(),
			{
				publishBattleLog: (logs, timeout) =>
					this.publishBattleLog(logs, timeout),
				randomizeOrder: props.randomizeOrder ?? true,
				id: props.gameId,
			},
		)

		this.createdTime = Date.now()
		this.id = 'game-controller_' + Math.random().toString()
		this.gameCode = props.gameCode || null
		this.spectatorCode = props.spectatorCode || null
		this.apiSecret = props.apiSecret || null
		this.task = null
		this.viewers = []

		this.waitingForTurnActionList = []
		this.turnActionListener = null

		this.player1Defs = player1
		this.player2Defs = player2

		let playerOne = this.game.arePlayersSwapped
			? this.game.currentPlayer
			: this.game.opponentPlayer
		let playerTwo = this.game.arePlayersSwapped
			? this.game.opponentPlayer
			: this.game.currentPlayer

		if (
			props.countAchievements === 'all' ||
			props.countAchievements === 'boss'
		) {
			if (this.player1Defs.model instanceof PlayerModel) {
				console.log(
					'Adding achievements',
					playerOne.playerName,
					this.player1Defs.model.name,
				)
				this.addAchievements(
					this.player1Defs.model,
					playerOne,
					props.countAchievements,
				)
			}
			if (this.player2Defs.model instanceof PlayerModel) {
				console.log(
					'Adding achievemnts',
					playerTwo.playerName,
					this.player2Defs.model.name,
				)
				this.addAchievements(
					this.player2Defs.model,
					playerTwo,
					props.countAchievements,
				)
			}
		}
	}

	public addAchievements(
		player: PlayerModel,
		playerComponent: PlayerComponent,
		restriction: 'all' | 'boss',
	) {
		if (player.achievementProgress) {
			ACHIEVEMENTS_LIST.forEach((achievement) => {
				if (restriction === 'boss' && !achievement.evilXAchievement) return
				if (restriction == 'all' && achievement.evilXAchievement) return

				if (!player.achievementProgress[achievement.numericId]) {
					player.achievementProgress[achievement.numericId] = {
						goals: {},
						levels: Array(achievement.levels.length)
							.fill(0)
							.flatMap(() => [{}]),
					}
				}
				const achievementComponent = this.game.components.new(
					AchievementComponent,
					achievement,
					playerComponent.entity,
					player.achievementProgress[achievement.numericId],
				)
				const achievementObserver = this.game.components.new(
					ObserverComponent,
					achievementComponent.entity,
				)
				achievementComponent.hooks.onComplete.add(
					achievementObserver.entity,
					(newProgress, level) => {
						const originalProgress =
							achievement.getProgress(
								player.achievementProgress[achievement.numericId].goals,
							) ?? 0
						this.onAchievementComplete(player, {
							achievementId: achievement.numericId,
							level,
							newProgress,
							originalProgress,
						})
					},
				)
				achievementComponent.props.onGameStart(
					this.game,
					playerComponent,
					achievementComponent,
					achievementObserver,
				)
			})
		}
	}

	public onAchievementComplete(
		_player: PlayerModel,
		_achievement: EarnedAchievement,
	) {}

	public addViewer(viewer: GameViewerProps) {
		assert(
			viewer.player,
			'Found player was undefined when trying to add a viewer',
		)
		let v = new GameViewer(this.game, viewer)
		this.viewers.push(v)
		return v
	}

	public removeViewer(viewer: GameViewer) {
		this.viewers = this.viewers.filter((v) => v.id !== viewer.id)
	}

	public getPlayers() {
		return this.viewers.map((viewer) => viewer.player)
	}

	public get players() {
		return this.viewers.reduce(
			(acc, viewer) => {
				acc[viewer.player.id] = viewer.player
				return acc
			},
			{} as Record<PlayerId, PlayerModel>,
		)
	}

	/* Wait until the game is ready to accept a turn action then send one */
	public async sendTurnAction(action: TurnActionAndPlayer) {
		await this.waitForTurnActionReady()
		if (this.turnActionListener) {
			await this.turnActionListener(action)
			this.turnActionListener = null
		}
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
			(this.game.rng() * 500 + 500)
		)
	}
}
