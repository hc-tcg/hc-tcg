import {CARDS} from 'common/cards'
import {STRENGTHS} from 'common/const/strengths'
import {CONFIG, EXPANSIONS} from 'common/config'
import {LocalGameState, LocalPlayerState} from 'common/types/game-state'
import {GameModel} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import Card from 'common/cards/base/card'
import {card, row, slot} from 'common/components/query'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
	WithoutFunctions,
} from 'common/types/server-requests'
import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import {Hermit} from 'common/cards/base/types'
import {CardEntity, newEntity} from 'common/entities'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

// Dear Reader,
// On 07/17/23, This still has not been sorted out properly. I think I might have
// even made it worse.
// Sincerely, Lunarmagpie

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
		hermitCards = hermitCards.filter((_card, index) => index !== randomIndex)

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

		const duplicates = deck.filter((card) => card.props.numericId === effectCard.props.numericId)
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
			props: WithoutFunctions(CARDS[card.props.numericId].props),
			entity: newEntity('card-entity') as CardEntity,
			slot: null,
		}
	})
}

export function getLocalPlayerState(
	game: GameModel,
	playerState: PlayerComponent
): LocalPlayerState {
	let singleUseSlot = game.components.find(SlotComponent, slot.singleUse)?.entity
	let singleUseCard =
		game.components.find(CardComponent, card.slotEntity(singleUseSlot))?.toLocalCardInstance() ||
		null

	if (!singleUseSlot) {
		throw new Error('Slot is missing when generating local game state.')
	}

	let board = {
		activeRow:
			game.components.findEntity(RowComponent, row.active, row.player(playerState.entity)) || null,
		singleUse: {slot: singleUseSlot, card: singleUseCard},
		singleUseCardUsed: playerState.singleUseCardUsed,
		rows: game.components
			.filter(RowComponent, row.player(playerState.entity))
			.map((row) => {
				const hermitCard = row.getHermit()
				const hermitSlot = row.getHermitSlot()
				const attachCard = row.getAttach()
				const attachSlot = row.getAttachSlot()

				const items = row.getItemSlots().map((itemSlot) => {
					return {
						slot: itemSlot.entity,
						card:
							game.components
								.find(CardComponent, card.slotEntity(itemSlot.entity))
								?.toLocalCardInstance() || null,
					}
				})

				if (!hermitSlot || !attachSlot)
					throw new Error('Slot is missing when generating local game state.')

				return [
					row.index,
					{
						entity: row.entity,
						hermit: {
							slot: hermitSlot.entity,
							card: (hermitCard?.toLocalCardInstance() as any) || null,
						},
						attach: {
							slot: attachSlot.entity,
							card: (attachCard?.toLocalCardInstance() as any) || null,
						},
						items: items,
						health: row.health,
					},
				] as const
			})
			.sort(([rowIndexA, _rowA], [rowIndexB, _rowB]) => rowIndexA - rowIndexB)
			.map(([_, row]) => row),
	}

	const localPlayerState: LocalPlayerState = {
		id: playerState.id,
		entity: playerState.entity,
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
	const playerState = game.components.find(
		PlayerComponent,
		(_game, playerState) => playerState.id == player.id
	)

	if (!playerState) throw new Error('Player should be added to ECS before fetching local state')

	const opponentState = playerState.opponentPlayer

	const isCurrentPlayer = game.currentPlayer.id === player.id
	const turnState = game.state.turn

	// convert player states
	const players: Record<PlayerId, LocalPlayerState> = {}
	players[player.id] = getLocalPlayerState(game, playerState)
	players[opponentState.id] = getLocalPlayerState(game, opponentState)

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
		const pickRequestCreator = game.components.get(currentPickRequest.id)
		if (pickRequestCreator) {
			currentPickMessage = `${pickRequestCreator.props.name}: ${currentPickMessage}`
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
			currentPlayerId: game.currentPlayer.id,
			currentPlayerEntity: game.currentPlayer.entity,
			availableActions: isCurrentPlayer
				? turnState.availableActions
				: turnState.opponentAvailableActions,
		},
		order: game.state.order,
		statusEffects: game.components
			.filter(StatusEffectComponent)
			.map((effect) => effect.toLocalStatusEffectInstance())
			.filter((effect) => effect !== null) as Array<LocalStatusEffectInstance>,

		// personal info
		hand: game.components
			.filter(CardComponent, card.slot(slot.player(playerState.entity), slot.hand))
			.sort(CardComponent.compareOrder)
			.map((inst) => inst.toLocalCardInstance()),
		pileCount: game.components.filter(
			CardComponent,
			card.slot(slot.player(playerState.entity), slot.deck)
		).length,
		discarded: game.components
			.filter(CardComponent, card.slot(slot.player(playerState.entity), slot.discardPile))
			.map((inst) => inst.toLocalCardInstance()),

		// ids
		playerId: player.id,
		opponentPlayerId: opponentState.id,
		playerEntity: players[player.id].entity,
		opponentPlayerEntity: players[opponentState.id].entity,

		lastActionResult: game.state.lastActionResult,

		currentCardsCanBePlacedIn: playerState
			.getCardsCanBePlacedIn()
			.map(([card, place]) => [card.toLocalCardInstance(), place]),
		currentPickableSlots,
		currentPickMessage,
		currentModalData,

		players,

		timer: game.state.timer,
	}

	return localGameState
}
