import {CARDS} from 'common/cards'
import {STRENGTHS} from 'common/const/strengths'
import {CONFIG, DEBUG_CONFIG} from 'common/config'
import {
	TurnActions,
	CardT,
	CoinFlipT,
	GameState,
	LocalGameState,
	LocalPlayerState,
	PlayerState,
	RowState,
	ActionResult,
	GenericActionResult,
} from 'common/types/game-state'
import {GameModel} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {EnergyT} from 'common/types/cards'
import {PickedSlots} from 'common/types/pick-process'
import {AttackModel} from 'common/models/attack-model'
import {GameHook, WaterfallHook} from 'common/types/hooks'
import Card from 'common/cards/base/card'
import HermitCard from 'common/cards/base/hermit-card'
import ItemCard from 'common/cards/base/item-card'
import EffectCard from 'common/cards/base/effect-card'
import {CardPosModel} from 'common/models/card-pos-model'
import {getCardCost, getCardRank} from 'common/utils/ranks'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const isHermitOrItem: (cardInfo: Card) => cardInfo is HermitCard | ItemCard = (
	cardInfo
): cardInfo is HermitCard | ItemCard => ['hermit', 'item'].includes(cardInfo.type)

const isHermit: (cardInfo: Card) => cardInfo is HermitCard = (cardInfo): cardInfo is HermitCard =>
	cardInfo.type === 'hermit'

const isEffect: (cardInfo: Card) => cardInfo is EffectCard = (cardInfo): cardInfo is EffectCard =>
	['effect', 'single_use'].includes(cardInfo.type)

export function getStarterPack() {
	const limits = CONFIG.limits

	// only allow some starting types
	const startingTypes = ['balanced', 'builder', 'farm', 'miner', 'redstone']
	const hermitTypesCount = randomBetween(2, 3)
	const hermitTypes = Object.keys(STRENGTHS)
		.filter((type) => startingTypes.includes(type))
		.sort(() => 0.5 - Math.random())
		.slice(0, hermitTypesCount)

	const cards = Object.values(CARDS).filter(
		(cardInfo) => !isHermitOrItem(cardInfo) || hermitTypes.includes(cardInfo.hermitType)
	)

	const effectCards = cards.filter(isEffect)
	const hermitCount = hermitTypesCount === 2 ? 8 : 10

	const deck: Array<Card> = []

	let itemCounts = {
		[hermitTypes[0]]: {
			items: 0,
			tokens: 0,
		},
		[hermitTypes[1]]: {
			items: 0,
			tokens: 0,
		},
	}
	if (hermitTypes[2]) {
		itemCounts[hermitTypes[2]] = {
			items: 0,
			tokens: 0,
		}
	}
	let tokens = 0

	// hermits, but not diamond ones
	let hermitCards = cards.filter(isHermit).filter((card) => getCardRank(card.id).name !== 'diamond')

	while (deck.length < hermitCount && hermitCards.length > 0) {
		const randomIndex = Math.floor(Math.random() * hermitCards.length)
		const hermitCard = hermitCards[randomIndex]

		// remove this option
		hermitCards = hermitCards.filter((card, index) => index !== randomIndex)

		// add 1 - 3 of this hermit
		const hermitAmount = Math.min(randomBetween(1, 3), hermitCount - deck.length)

		tokens += getCardCost(hermitCard) * hermitAmount
		for (let i = 0; i < hermitAmount; i++) {
			deck.push(hermitCard)
			itemCounts[hermitCard.hermitType].items += 2
		}
	}

	// items
	for (let hermitType in itemCounts) {
		let counts = itemCounts[hermitType]

		for (let i = 0; i < counts.items; i++) {
			deck.push(CARDS[`item_${hermitType}_common`])
		}
	}

	let loopBreaker = 0
	// effects
	while (deck.length < limits.maxCards) {
		const effectCard = effectCards[Math.floor(Math.random() * effectCards.length)]

		const duplicates = deck.filter((card) => card.id === effectCard.id)
		if (duplicates.length >= limits.maxDuplicates) continue

		const tokenCost = getCardCost(effectCard)
		if (tokens + tokenCost >= limits.maxDeckCost) {
			loopBreaker++
			continue
		} else {
			loopBreaker = 0
		}
		if (loopBreaker >= 10000) {
			const err = new Error()
			console.log('Broke out of loop while generating starter deck!', err.stack)
			break
		}

		tokens += tokenCost
		deck.push(effectCard)
	}

	const deckIds: Array<string> = deck.map((card) => card.id)
	return deckIds
}

export function getEmptyRow(): RowState {
	const MAX_ITEMS = 3

	const rowState: RowState = {
		hermitCard: null,
		effectCard: null,
		itemCards: new Array(MAX_ITEMS).fill(null),
		health: null,
		ailments: [],
	}
	return rowState
}

export function getPlayerState(player: PlayerModel): PlayerState {
	const allCards = Object.values(CARDS).map(
		(card: Card): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)
	let pack = DEBUG_CONFIG.unlimitedCards ? allCards : player.playerDeck.cards

	// shuffle cards
	!DEBUG_CONFIG.unlimitedCards && pack.sort(() => 0.5 - Math.random())

	// randomize instances
	pack = pack.map((card) => {
		return {
			cardId: card.cardId,
			cardInstance: Math.random().toString(),
		}
	})

	// ensure a hermit in first 5 cards
	const hermitIndex = pack.findIndex((card) => {
		return CARDS[card.cardId].type === 'hermit'
	})
	if (hermitIndex > 5) {
		;[pack[0], pack[hermitIndex]] = [pack[hermitIndex], pack[0]]
	}

	const amountOfStartingCards =
		DEBUG_CONFIG.startWithAllCards || DEBUG_CONFIG.unlimitedCards ? pack.length : 7
	const hand = pack.slice(0, amountOfStartingCards)

	for (let i = 0; i < DEBUG_CONFIG.extraStartingCards.length; i++) {
		const id = DEBUG_CONFIG.extraStartingCards[i]
		const card = CARDS[id]
		if (!card) {
			console.log('Invalid extra starting card in debug config:', id)
		}

		const cardInfo = {
			cardId: id,
			cardInstance: Math.random().toString(),
		}
		pack.push(cardInfo)
		hand.unshift(cardInfo)
	}

	const TOTAL_ROWS = 5
	return {
		id: player.playerId,
		playerName: player.playerName,
		minecraftName: player.minecraftName,
		playerDeck: pack,
		censoredPlayerName: player.censoredPlayerName,
		coinFlips: [],
		lives: 3,
		hand,
		discarded: [],
		pile: DEBUG_CONFIG.startWithAllCards || DEBUG_CONFIG.unlimitedCards ? [] : pack.slice(7),
		custom: {},
		board: {
			activeRow: null,
			singleUseCard: null,
			singleUseCardUsed: false,
			rows: new Array(TOTAL_ROWS).fill(null).map(getEmptyRow),
		},

		pickRequests: [],
		modalRequests: [],

		hooks: {
			availableEnergy: new WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>(),
			blockedActions: new WaterfallHook<(blockedActions: TurnActions) => TurnActions>(),

			onAttach: new GameHook<(instance: string) => void>(),
			onDetach: new GameHook<(instance: string) => void>(),
			beforeApply: new GameHook<(pickedSlots: PickedSlots) => void>(),
			onApply: new GameHook<(pickedSlots: PickedSlots) => void>(),
			afterApply: new GameHook<(pickedSlots: PickedSlots) => void>(),
			getAttacks: new GameHook<(pickedSlots: PickedSlots) => Array<AttackModel>>(),
			beforeAttack: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			beforeDefence: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			onAttack: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			onDefence: new GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>(),
			afterAttack: new GameHook<(attack: AttackModel) => void>(),
			afterDefence: new GameHook<(attack: AttackModel) => void>(),
			onHermitDeath: new GameHook<(hermitPos: CardPosModel) => void>(),
			onTurnStart: new GameHook<() => void>(),
			onTurnEnd: new GameHook<(drawCards: Array<CardT>) => void>(),
			onTurnTimeout: new GameHook<(newAttacks: Array<AttackModel>) => void>(),
			onCoinFlip: new GameHook<(id: string, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>>(),
			beforeActiveRowChange: new GameHook<(oldRow: number | null, newRow: number) => boolean>(),
			onActiveRowChange: new GameHook<(oldRow: number | null, newRow: number) => void>(),
		},
	}
}

export function getLocalPlayerState(playerState: PlayerState): LocalPlayerState {
	const localPlayerState: LocalPlayerState = {
		id: playerState.id,
		playerName: playerState.playerName,
		minecraftName: playerState.minecraftName,
		censoredPlayerName: playerState.censoredPlayerName,
		coinFlips: playerState.coinFlips,
		custom: playerState.custom,
		lives: playerState.lives,
		board: playerState.board,
	}
	return localPlayerState
}

export function getLocalGameState(game: GameModel, player: PlayerModel): LocalGameState | null {
	const opponentPlayerId = game.getPlayerIds().find((id) => id !== player.playerId)
	if (!opponentPlayerId) {
		return null
	}

	const playerState = game.state.players[player.playerId]
	const opponentState = game.state.players[opponentPlayerId]
	const turnState = game.state.turn
	const isCurrentPlayer = turnState.currentPlayerId === player.playerId

	// convert player states
	const players: Record<string, LocalPlayerState> = {}
	players[player.playerId] = getLocalPlayerState(playerState)
	players[opponentPlayerId] = getLocalPlayerState(opponentState)

	// Generate pick message, adding in card name if id exists
	const currentPickRequest = playerState.pickRequests[0]
	let currentPickMessage = currentPickRequest?.message || null

	if (currentPickRequest && currentPickRequest.id) {
		const cardInfo = CARDS[currentPickRequest.id]
		if (cardInfo) {
			currentPickMessage = `${cardInfo.name}: ${currentPickMessage}`
		}
	}

	const localGameState: LocalGameState = {
		turn: {
			turnNumber: turnState.turnNumber,
			currentPlayerId: turnState.currentPlayerId,
			availableActions: isCurrentPlayer
				? turnState.availableActions
				: turnState.opponentAvailableActions,
		},
		order: game.state.order,

		// personal info
		hand: playerState.hand,
		pileCount: playerState.pile.length,
		discarded: playerState.discarded,

		// ids
		playerId: player.playerId,
		opponentPlayerId: opponentPlayerId,

		lastActionResult: game.state.lastActionResult,

		currentPickMessage,
		currentCustomModal: playerState.modalRequests[0]?.id || null,

		players,

		timer: game.state.timer,
	}

	return localGameState
}
