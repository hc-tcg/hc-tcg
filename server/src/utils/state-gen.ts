import {CARDS} from 'common/cards'
import {STRENGTHS} from 'common/const/strengths'
import {CONFIG, DEBUG_CONFIG, EXPANSIONS} from 'common/config'
import {
	TurnActions,
	CoinFlipT,
	LocalGameState,
	LocalPlayerState,
	PlayerState,
	newEntity,
	CardEntity,
} from 'common/types/game-state'
import {GameModel} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {EnergyT} from 'common/types/cards'
import {AttackModel} from 'common/models/attack-model'
import {GameHook, WaterfallHook} from 'common/types/hooks'
import Card, {Attach, HasHealth, Hermit} from 'common/cards/base/card'
import {HermitAttackType} from 'common/types/attack'
import {SlotCondition, card, row, slot} from 'common/filters'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import {CardComponent, HandSlotComponent} from 'common/types/components'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getStarterPack(): Array<LocalCardInstance> {
	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['balanced', 'builder', 'farm', 'miner', 'redstone']
	const typesCount = randomBetween(2, 3)
	const types = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, typesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) =>
			!cardInfo.isHermit() ||
			!cardInfo.isItem() ||
			(types.includes(cardInfo.props.type) &&
				!EXPANSIONS.disabled.includes(cardInfo.props.expansion))
	)

	const effectCards = cards.filter((card) => card.isSingleUse() || card.isAttach())
	const hermitCount = typesCount === 2 ? 8 : 10

	const deck: Array<Card> = []

	let itemCounts = {
		[types[0]]: {
			items: 0,
			tokens: 0,
		},
		[types[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (types[2]) {
		itemCounts[types[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// hermits, but not diamond ones
	let hermitCards = cards
		.filter((card) => card.isHermit())
		.filter((card) => card.props.name !== 'diamond') as Array<Card<Hermit>>

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(randomBetween(1, 3), hermitCount - deck.length)

		tokens += hermitCard.props.tokens * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			// @todo Figure out why this is broken
			// Possibly just need to enable all types?
			// itemCounts[hermitCard.props.type].items += 2
		}
	}

	// items
	for (let type in itemCounts) {
		let counts = itemCounts[type]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${type}_common`])
		}
	}

	let loopBreaker = 0
	// effects
	while (deck.length < limits.maxCards && deck.length < effectCards.length) {
		const effectCard = effectCards[Math.floor(Math.random() * effectCards.length)]

		const duplicates = deck.filter((card) => card.props.id === effectCard.props.id)
		if (duplicates.length >= limits.maxDuplicates) continue

		const tokenCost = effectCard.props.tokens
		if (tokens + tokenCost >= limits.maxDeckCost) {
			loopBreaker++
			continue
		} else {
			loopBreaker = 0
		}
		if (loopBreaker >= 100) {
			const err = new Error()
			console.log('Broke out of loop while generating starter deck!', err.stack)
			break
		}

		tokens += tokenCost
		deck.push(effectCard)
	}

	return deck.map((card) => {
		return {
			props: WithoutFunctions(CARDS[card.props.id].props),
			instance: newEntity() as CardEntity,
			slot: null,
		}
	})
}

export function getPlayerState(game: GameModel, player: PlayerModel): PlayerState {
	for (let i = 0; i < DEBUG_CONFIG.extraStartingCards.length; i++) {
		const id = DEBUG_CONFIG.extraStartingCards[i]
		if (!CARDS[id]) {
			console.log('Invalid extra starting card in debug config:', id)
			continue
		}

		let card = game.state.cards.new(CardComponent, id, player.id)
		card.slot = game.state.slots.new(HandSlotComponent, player.id)
	}

	return {
		id: player.id,
		playerName: player.name,
		minecraftName: player.minecraftName,
		censoredPlayerName: player.censoredName,
		coinFlips: [],
		lives: 3,
		hasPlacedHermit: false,
		singleUseCardUsed: false,
		cardsCanBePlacedIn: [],
		pickableSlots: null,
		activeRowEntity: null,

		hooks: {
			availableEnergy: new WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>(),
			blockedActions: new WaterfallHook<(blockedActions: TurnActions) => TurnActions>(),

			onAttach: new GameHook<(instance: CardComponent) => void>(),
			onDetach: new GameHook<(instance: CardComponent) => void>(),
			beforeApply: new GameHook<() => void>(),
			onApply: new GameHook<() => void>(),
			afterApply: new GameHook<() => void>(),
			getAttackRequests: new GameHook<
				(activeInstance: CardComponent, hermitAttackType: HermitAttackType) => void
			>(),
			getAttack: new GameHook<() => AttackModel | null>(),
			beforeAttack: new GameHook<(attack: AttackModel) => void>(),
			beforeDefence: new GameHook<(attack: AttackModel) => void>(),
			onAttack: new GameHook<(attack: AttackModel) => void>(),
			onDefence: new GameHook<(attack: AttackModel) => void>(),
			afterAttack: new GameHook<(attack: AttackModel) => void>(),
			afterDefence: new GameHook<(attack: AttackModel) => void>(),
			onTurnStart: new GameHook<() => void>(),
			onTurnEnd: new GameHook<(drawCards: Array<CardComponent | null>) => void>(),
			onCoinFlip: new GameHook<
				(card: CardComponent, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>
			>(),
			beforeActiveRowChange: new GameHook<
				(oldRow: number | null, newRow: number | null) => boolean
			>(),
			onActiveRowChange: new GameHook<(oldRow: number | null, newRow: number | null) => void>(),
			freezeSlots: new GameHook<() => SlotCondition>(),
		},
	}
}

export function getLocalPlayerState(game: GameModel, playerState: PlayerState): LocalPlayerState {
	let board = {
		activeRow: game.state.rows.find(row.active, row.player(playerState.id)) || null,
		singleUseCard:
			game.state.cards
				.findComponent(card.singleUse, card.slotFulfills(slot.singleUseSlot))
				?.toLocalCardInstance() || null,
		singleUseCardUsed: playerState.singleUseCardUsed,
		rows: game.state.rows.filterComponents(row.player(playerState.id)).map((row) => {
			const hermit = game.state.slots.find(slot.hermitSlot, slot.row(row.entity))
			const hermitCard = game.state.cards.findComponent(
				card.slot(hermit)
			) as CardComponent<HasHealth> | null

			const attach = game.state.slots.find(slot.attachSlot, slot.row(row.entity))
			const attachCard = game.state.cards.findComponent(
				card.slot(attach)
			) as CardComponent<Attach> | null

			const items = game.state.slots
				.filterComponents(slot.itemSlot, slot.row(row.entity))
				.map((itemSlot) => {
					return {
						slot: itemSlot.entity,
						card:
							game.state.cards.findComponent(card.slot(itemSlot.entity))?.toLocalCardInstance() ||
							null,
					}
				})

			if (!hermit || !attach) throw new Error('Slot is missing when generating local game state.')

			return {
				entity: row.entity,
				hermit: {slot: hermit, card: hermitCard?.toLocalCardInstance() || null},
				attach: {slot: attach, card: attachCard?.toLocalCardInstance() || null},
				items: items,
				health: row.health,
			}
		}),
	}

	const localPlayerState: LocalPlayerState = {
		id: playerState.id,
		playerName: playerState.playerName,
		minecraftName: playerState.minecraftName,
		censoredPlayerName: playerState.censoredPlayerName,
		coinFlips: playerState.coinFlips,
		lives: playerState.lives,
		board: board,
	}
	return localPlayerState
}

export function getLocalGameState(game: GameModel, player: PlayerModel): LocalGameState | null {
	const opponentPlayerId = game.getPlayerIds().find((id) => id !== player.id)
	if (!opponentPlayerId) {
		return null
	}

	const playerState = game.state.players[player.id]
	const opponentState = game.state.players[opponentPlayerId]
	const turnState = game.state.turn
	const isCurrentPlayer = turnState.currentPlayerId === player.id

	// convert player states
	const players: Record<string, LocalPlayerState> = {}
	players[player.id] = getLocalPlayerState(game, playerState)
	players[opponentPlayerId] = getLocalPlayerState(game, opponentState)

	// Pick message or modal id
	playerState.pickableSlots = null
	let currentPickMessage = null
	let currentModalData = null

	const currentPickRequest = game.state.pickRequests[0]
	const currentModalRequest = game.state.modalRequests[0]

	if (currentModalRequest?.playerId === player.id) {
		// We must send modal requests first, to stop pick requests from overwriting them.
		currentModalData = currentModalRequest.data
	} else if (currentPickRequest?.playerId === player.id) {
		// Once there are no modal requests, send pick requests
		currentPickMessage = currentPickRequest.message
		// Add the card name before the request
		const cardInfo = CARDS[currentPickRequest.id]
		if (cardInfo) {
			currentPickMessage = `${cardInfo.props.name}: ${currentPickMessage}`
		}
		// We also want to highlight the slots for the player that must select a slot
		if (currentPickRequest.playerId == player.id) {
			playerState.pickableSlots = game.getPickableSlots(currentPickRequest.canPick)
		}
		// We also want to highlight the slots for the player that must select a slot
		if (currentPickRequest.playerId == player.id) {
			playerState.pickableSlots = game.getPickableSlots(currentPickRequest.canPick)
		}
	}

	let currentPickableSlots = playerState.pickableSlots

	const localGameState: LocalGameState = {
		turn: {
			turnNumber: turnState.turnNumber,
			currentPlayerId: turnState.currentPlayerId,
			availableActions: isCurrentPlayer
				? turnState.availableActions
				: turnState.opponentAvailableActions,
		},
		order: game.state.order,
		statusEffects: game.state.statusEffects
			.list()
			.map((effect) => effect.toLocalStatusEffectInstance()),

		// personal info
		hand: game.state.cards
			.filterComponents(card.slotFulfills(slot.player(playerState.id), slot.hand))
			.map((inst) => inst.toLocalCardInstance()),
		pileCount: game.state.cards.filter(card.slotFulfills(slot.player(playerState.id), slot.pile))
			.length,
		discarded: game.state.cards
			.filterComponents(card.slotFulfills(slot.player(playerState.id), slot.discardPile))
			.map((inst) => inst.toLocalCardInstance()),

		// ids
		playerId: player.id,
		opponentPlayerId: opponentPlayerId,

		lastActionResult: game.state.lastActionResult,

		currentCardsCanBePlacedIn: playerState.cardsCanBePlacedIn.map(([card, place]) => [
			card.toLocalCardInstance(),
			place,
		]),
		currentPickableSlots,
		currentPickMessage,
		currentModalData,

		players,

		timer: game.state.timer,
	}

	return localGameState
}
