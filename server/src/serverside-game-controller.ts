import {ACHIEVEMENTS_LIST} from 'common/achievements'
import {
	AchievementComponent,
	CardComponent,
	ObserverComponent,
	PlayerComponent,
} from 'common/components'
import {PlayerEntity} from 'common/entities'
import {
	GameController,
	GameControllerProps,
	GameViewer,
} from 'common/game/game-controller'
import {PlayerSetupDefs} from 'common/game/setup-game'
import {GameModel} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	ReconnectProps,
	ServerMessage,
	serverMessages,
} from 'common/socket-messages/server-messages'
import {IncompleteCoinFlip, Message} from 'common/types/game-state'
import {broadcast} from './utils/comm'
import query from 'common/components/query'
import assert from 'assert'

type ServerGameViewerProps = {
	spectator: boolean
	replayer: boolean
	playerOnLeft: PlayerEntity
	player: PlayerModel
}

export class ServerGameViewer extends GameViewer {
	player: PlayerModel

	constructor(game: GameModel, props: ServerGameViewerProps) {
		super(game, props)
		this.player = props.player
	}
}

export class ServerSideGameController extends GameController {
	override viewers: Array<ServerGameViewer> = []

	constructor(
		player1: PlayerSetupDefs,
		player2: PlayerSetupDefs,
		props: GameControllerProps,
	) {
		super(player1, player2, props)
		if (
			props.countAchievements === 'all' ||
			props.countAchievements === 'boss'
		) {
			if (this.player1Defs.model instanceof PlayerModel) {
				console.log(
					'Adding achievements',
					this.playerOne.playerName,
					this.player1Defs.model.name,
				)
				this.addAchievements(
					this.player1Defs.model,
					this.playerOne,
					props.countAchievements,
				)
			}
			if (this.player2Defs.model instanceof PlayerModel) {
				console.log(
					'Adding achievemnts',
					this.playerTwo.playerName,
					this.player2Defs.model.name,
				)
				this.addAchievements(
					this.player2Defs.model,
					this.playerTwo,
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
						broadcast([player], {
							type: serverMessages.ACHIEVEMENT_COMPLETE,
							achievement: {
								achievementId: achievement.numericId,
								level,
								newProgress,
								originalProgress,
							},
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

	public getPlayers() {
		return this.viewers.map((viewer) => viewer.player!)
	}

	public get players() {
		return this.viewers.reduce(
			(acc, viewer) => {
				if (!viewer.player) return acc
				acc[viewer.player.id] = viewer.player
				return acc
			},
			{} as Record<PlayerId, PlayerModel>,
		)
	}

	override async publishBattleLog(logs: Array<Message>, timeout: number) {
		// We skip waiting for the logs to send if there are no players. This is because
		// the coin flip delay confuses jest. Additionally we don't want to wait longer
		// than what is needed in tests.
		if (this.getPlayers().length === 0) {
			this.chat.push(...logs)
			return
		}

		await new Promise((e) => setTimeout(e, timeout))

		this.chat.push(...logs)
		this.chatUpdate()
	}

	override addViewer(viewer: {
		spectator: boolean
		replayer: boolean
		playerOnLeft: PlayerEntity
		player: PlayerModel
	}): ServerGameViewer {
		const v = new ServerGameViewer(this.game, viewer)
		this.viewers.push(v)
		return v
	}

	/** Send new chat messages to the viewers */
	public chatUpdate() {
		broadcast(this.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: this.chat,
		})
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.viewers.map((viewer) => viewer.player),
			payload,
		)
	}

	public getOpponentId(playerId: PlayerId) {
		const players = this.viewers
			.filter((viewer) => !viewer.spectator)
			.map((viewer) => viewer.player)
		return players.filter((p) => p?.id !== playerId)[0]?.id || null
	}

	public getPlayerEntity(id: PlayerId) {
		let viewer = this.viewers.find((v) => v.player.id === id && !v.spectator)
		return viewer?.playerOnLeftEntity
	}

	/** Gets the game props to send to a player.
	 * This function should be used for reconnects. It will reveal all cards that need to be visible for the reconnect to work.
	 */
	public getGamePropsForPlayer(player: PlayerId): ReconnectProps {
		let playerEntity = this.getPlayerEntity(player)
		assert(playerEntity)

		const myHandCards = this.game.components
			.filter(
				CardComponent,
				query.card.player(playerEntity),
				query.card.slot(query.slot.hand),
			)
			.sort(CardComponent.compareOrder)
		const myDeckCards = this.game.components
			.filter(
				CardComponent,
				query.card.player(playerEntity),
				query.card.slot(query.slot.deck),
			)
			.sort(CardComponent.compareOrder)
		const opponentHandCards = this.game.components
			.filter(
				CardComponent,
				query.not(query.card.player(playerEntity)),
				query.card.slot(query.slot.hand),
			)
			.sort(CardComponent.compareOrder)
		const opponentDeckCards = this.game.components
			.filter(
				CardComponent,
				query.not(query.card.player(playerEntity)),
				query.card.slot(query.slot.deck),
			)
			.sort(CardComponent.compareOrder)

		let myDeck = {
			type: 'hidden' as 'hidden',
			entities: [
				...myHandCards.map((c) => c.entity),
				...myDeckCards.map((c) => c.entity),
			],
			initialHand: myHandCards.map((c) => c.props.id),
		}

		let opponentDeck = {
			type: 'hidden' as 'hidden',
			entities: [
				...opponentHandCards.map((c) => c.entity),
				...opponentDeckCards.map((c) => c.entity),
			],
		}

		return {
			playerEntity: this.playerOne.entity,
			spectatorCode: this.spectatorCode ?? undefined,
			playerOneDefs:
				playerEntity == this.game.playerOne
					? {
							...this.player1Defs,
							deck: myDeck,
						}
					: {
							...this.player2Defs,
							deck: opponentDeck,
						},
			playerTwoDefs:
				playerEntity == this.game.playerOne
					? {
							...this.player2Defs,
							deck: opponentDeck,
						}
					: {
							...this.player1Defs,
							deck: myDeck,
						},
			coinFlipHistory: this.game.coinFlipHistory,
			props: this.props,
			messages: this.chat,
			gameHistory: this.game.turnActions,
		}
	}

	public override startCoinFlip(
		coinFlip: IncompleteCoinFlip,
		callback: (result: Array<'heads' | 'tails'>) => any,
	) {
		const coinFlips: Array<'heads' | 'tails'> = []
		for (let i = 0; i < coinFlip.numberOfCoins; i++) {
			const coinFlip = Math.random() >= 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}

		this.broadcastToViewers({
			type: serverMessages.GAME_SEND_COIN_FLIP,
			result: coinFlips,
		})

		callback(coinFlips)
	}
}
