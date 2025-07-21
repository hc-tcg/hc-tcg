import {Achievement} from 'common/achievements/types'
import EvilXisumaBoss, {
	BOSS_ATTACK,
	supplyBossAttack,
} from 'common/cards/boss/hermits/evilxisuma_boss'
import {Card} from 'common/cards/types'
import {
	AchievementComponent,
	BoardSlotComponent,
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
} from 'common/components'
import query, {ComponentQuery} from 'common/components/query'
import {defaultAppearance} from 'common/cosmetics/default'
import {PlayerEntity} from 'common/entities'
import {GameController} from 'common/game/game-controller'
import {getLocalCard} from 'common/game/make-local-state'
import runGame from 'common/game/run-game'
import {PlayerSetupDefs} from 'common/game/setup-game'
import {GameModel, GameSettings} from 'common/models/game-model'
import {SlotTypeT} from 'common/types/cards'
import {GameOutcome} from 'common/types/game-state'
import {LocalModalResult} from 'common/types/server-requests'
import {
	attackToAttackAction,
	slotToPlayCardAction,
} from 'common/types/turn-action-data'

function getTestPlayer(playerName: string, deck: Array<Card>): PlayerSetupDefs {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
			appearance: defaultAppearance,
			uuid: '',
		},
		deck,
		score: 0,
	}
}

export function findCardInHand(player: PlayerComponent, card: Card) {
	let cardInHand = player
		.getHand()
		.find((cardComponent) => cardComponent.props.id === card.id)
	if (!cardInHand) throw new Error(`Could not find card \`${card.id}\` in hand`)
	return cardInHand
}

export function getWinner(game: GameModel): PlayerComponent | null {
	if (game.outcome === undefined) return null
	if (game.outcome.type === 'tie') return null
	if (game.outcome.type === 'game-crash') return null
	return game.components.find(
		PlayerComponent,
		(_game, component) =>
			game.outcome?.type === 'player-won' &&
			component.entity === game.outcome.winner,
	)
}

export class TestGameFixture {
	con: GameController
	game: GameModel

	constructor(con: GameController) {
		this.con = con
		this.game = con.game
	}

	/** End the current player's turn. */
	async endTurn() {
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: 'END_TURN',
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Play a card from your hand to a row on the game board */
	async playCardFromHand(card: Card, slotType: 'single_use'): Promise<any>
	async playCardFromHand(
		card: Card,
		slotType: 'hermit' | 'attach',
		row: number,
		player?: PlayerEntity,
	): Promise<any>
	async playCardFromHand(
		card: Card,
		slotType: 'item',
		row: number,
		index: number,
		player?: PlayerEntity,
	): Promise<any>
	async playCardFromHand(
		card: Card,
		slotType: SlotTypeT,
		row?: number,
		indexOrPlayer?: number | PlayerEntity,
		itemSlotPlayer?: PlayerEntity,
	) {
		let cardComponent = findCardInHand(this.game.currentPlayer, card)
		const player =
			itemSlotPlayer ||
			(typeof indexOrPlayer === 'string'
				? indexOrPlayer
				: this.game.currentPlayerEntity)
		const index = typeof indexOrPlayer === 'number' ? indexOrPlayer : undefined

		const slot = this.game.components.find(
			SlotComponent,
			query.slot.player(player),
			(_game, slot) =>
				(!slot.inRow() && index === undefined) ||
				(slot.inRow() && slot.row.index === row),
			(_game, slot) =>
				index === undefined || (slot.inRow() && slot.index === index),
			(_game, slot) => slot.type === slotType,
		)!

		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: slotToPlayCardAction[cardComponent.props.category],
				card: getLocalCard(this.game, cardComponent),
				slot: slot.entity,
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Apply the effect card in the single use slot. This should be used to apply status effects that use the "should apply" modal. */
	async applyEffect() {
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: 'APPLY_EFFECT',
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Removes the effect card in the single use slot. This should be used to cancel effects that use the "should apply" modal or cancel an attack with pick requests. */
	async removeEffect() {
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: 'REMOVE_EFFECT',
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Attack with the current player. */
	async attack(attack: 'primary' | 'secondary' | 'single-use') {
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: attackToAttackAction[attack],
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Change the active hermit row for the current player. */
	async changeActiveHermit(index: number) {
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayer.entity,
			action: {
				type: 'CHANGE_ACTIVE_HERMIT',
				entity: this.game.components.findEntity(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.rowIndex(index),
				)!,
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Pick a slot for a pick request */
	async pick(...slot: Array<ComponentQuery<SlotComponent>>) {
		await this.con.sendTurnAction({
			playerEntity: this.game.state.pickRequests[0].player,
			action: {
				type: 'PICK_REQUEST',
				entity: this.game.components.find(SlotComponent, ...slot)!.entity,
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/** Respond to a modal request. */
	async finishModalRequest(modalResult: LocalModalResult) {
		await this.con.sendTurnAction({
			playerEntity: this.game.state.modalRequests[0].player,
			action: {
				type: 'MODAL_REQUEST',
				modalResult,
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/* Have `player` forfeit from the game. */
	async forfeit(player: PlayerEntity) {
		await this.con.sendTurnAction({
			playerEntity: player,
			action: {
				type: 'FORFEIT',
				player,
			},
		})
		await this.con.waitForTurnActionReady()
	}

	/* Disconnect `player` from the game. */
	async disconnect(player: PlayerEntity) {
		await this.con.sendTurnAction({
			playerEntity: player,
			action: {
				type: 'DISCONNECT',
				player,
			},
		})
		await this.con.waitForTurnActionReady()
	}
}

export class BossGameTestFixture extends TestGameFixture {
	async bossAttack(...attack: BOSS_ATTACK) {
		const bossCard = this.game.components.find(
			CardComponent,
			query.card.is(EvilXisumaBoss),
			query.card.currentPlayer,
		)
		const attackType = this.game.state.turn.availableActions.find(
			(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
		)
		if (bossCard === null) throw new Error('Boss card not found to attack with')
		if (attackType === undefined)
			throw new Error('Boss can not attack right now')
		supplyBossAttack(bossCard, attack)
		await this.con.sendTurnAction({
			playerEntity: this.game.currentPlayerEntity,
			action: {
				type: attackType,
			},
		})
		await this.con.waitForTurnActionReady()
	}
}

const defaultGameSettings = {
	maxTurnTime: 90 * 1000,
	extraActionTime: 30 * 1000,
	gameTimeout: 5000,
	showHooksState: {
		enabled: false,
		clearConsole: false,
	},
	blockedActions: [],
	availableActions: [],
	autoEndTurn: false,
	disableDeckOut: true,
	startWithAllCards: false,
	unlimitedCards: false,
	oneShotMode: false,
	extraStartingCards: [],
	disableDamage: false,
	noItemRequirements: false,
	forceCoinFlip: true,
	shuffleDeck: false,
	logErrorsToStderr: false,
	verboseLogging: !!process.env.UNIT_VERBOSE,
	disableRewardCards: false,
	logAttackHistory: true,
} satisfies GameSettings

/**
 * Test a saga against a game. The game is created with default settings similar to what would be found in production.
 * Note that decks are not shuffled in test games.
 */
export async function testGame(
	options: {
		testGame: (test: TestGameFixture, game: GameModel) => any
		// This is the place to check the state of the game after it ends.
		then?: (game: GameModel, outcome: GameOutcome) => any
		playerOneDeck: Array<Card>
		playerTwoDeck: Array<Card>
	},
	settings: Partial<GameSettings> = {},
) {
	let controller = new GameController(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			randomizeOrder: false,
			randomSeed: 'Test Game Seed',
			settings: {
				...defaultGameSettings,
				...settings,
			},
		},
	)

	let testEnded = false

	await Promise.race([
		runGame(controller),
		(async () => {
			await options.testGame(new TestGameFixture(controller), controller.game)
			testEnded = true
		})(),
	])

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}

	if (options.then) {
		options.then(controller.game, controller.game.outcome!)
	}
}

/**
 * Works similarly to `testGame`, but for testing the Evil X boss fight
 */
export async function testBossFight(
	options: {
		/**
		 * ```ts
		 * testGame: async (test, game) => {
		 * 	...
		 * 	await test.endTurn()
		 * 	// Boss' first turn
		 * 	await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
		 * 	await test.bossAttack( '50DMG')
		 * 	...
		 * }
		 * ```
		 */
		testGame: (test: BossGameTestFixture, game: GameModel) => any
		// This is the place to check the state of the game after it ends.
		then?: (game: GameModel) => any
		playerDeck: Array<Card>
	},
	settings?: Partial<GameSettings>,
) {
	let controller = new GameController(
		getTestPlayer('playerOne', options.playerDeck),
		{
			model: {
				name: 'Evil Xisuma',
				censoredName: 'Evil Xisuma',
				minecraftName: 'EvilXisuma',
				appearance: {...defaultAppearance},
				uuid: '',
				disableDeckingOut: true,
			},
			deck: [EvilXisumaBoss],
			score: 0,
		},
		{
			randomizeOrder: false,
			randomSeed: 'Boss fight seed',
			settings: {...defaultGameSettings, ...settings, disableRewardCards: true},
		},
	)

	controller.game.state.isEvilXBossGame = true

	function destroyRow(row: RowComponent) {
		controller.game.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) => controller.game.components.delete(slotEntity))
		controller.game.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	controller.game.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			(_game, row) => row.index > 2,
		)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	controller.game.components
		.filter(
			RowComponent,
			query.row.currentPlayer,
			query.not(query.row.index(0)),
		)
		.forEach(destroyRow)
	// Remove boss' item slots
	controller.game.components
		.filter(RowComponent, query.row.currentPlayer)
		.forEach((row) => {
			row.itemsSlotEntities?.forEach((slotEntity) =>
				controller.game.components.delete(slotEntity),
			)
			row.itemsSlotEntities = []
		})

	let testEnded = false

	await Promise.race([
		runGame(controller),
		(async () => {
			await options.testGame(
				new BossGameTestFixture(controller),
				controller.game,
			)
			testEnded = true
		})(),
	])

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}

	if (options.then) options.then(controller.game)
}

/** Test an achievement for player one in a game */
export async function testAchivement(
	options: {
		achievement: Achievement
		playGame: (test: TestGameFixture, game: GameModel) => any
		checkAchivement: (
			game: GameModel,
			achievement: AchievementComponent,
			outcome: GameOutcome,
		) => any
		playerOneDeck: Array<Card>
		playerTwoDeck: Array<Card>
	},
	settings: Partial<GameSettings> = {},
) {
	let achievementComponent: AchievementComponent
	let player: PlayerComponent

	let achievementTest = async (test: TestGameFixture, game: GameModel) => {
		player = game.currentPlayer
		let achievementProgress: Record<number, number> = {}

		achievementComponent = game.components.new(
			AchievementComponent,
			options.achievement.numericId,
			player.entity,
			{goals: achievementProgress, levels: []},
		)
		const achievementObserver = game.components.new(
			ObserverComponent,
			achievementComponent.entity,
		)

		options.achievement.onGameStart(
			game,
			player,
			achievementComponent,
			achievementObserver,
		)

		await options.playGame(test, game)
	}

	let then = function (game: GameModel, gameOutcome: GameOutcome) {
		options.achievement.onGameEnd(
			game,
			player,
			achievementComponent,
			gameOutcome,
		)
		options.checkAchivement(game, achievementComponent, gameOutcome)
	}

	await testGame(
		{
			testGame: achievementTest,
			then,
			playerOneDeck: options.playerOneDeck,
			playerTwoDeck: options.playerTwoDeck,
		},
		settings,
	)
}

export async function testReplayGame(options: {
	runGame: (test: TestGameFixture, con: GameController) => any
	afterGame: (con: GameController) => any
	playerOneDeck: Array<Card>
	playerTwoDeck: Array<Card>
	seed?: string
	shuffleDeck?: boolean
}) {
	const controller = new GameController(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			randomizeOrder: true,
			// The default seed always ensures player one goes first. Because how replays work, turn order needs to be random here
			randomSeed: options.seed ? options.seed : '1234567',
			settings: {
				...defaultGameSettings,
				shuffleDeck: options.shuffleDeck || false,
				verboseLogging: false,
				forceCoinFlip: false,
				disableDeckOut: false,
				disableRewardCards: false,
			},
		},
	)

	await Promise.race([
		runGame(controller),
		(async () => {
			await options.runGame(new BossGameTestFixture(controller), controller)
		})(),
	])
}
