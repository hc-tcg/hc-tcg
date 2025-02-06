import {Card} from 'common/cards/types'
import {
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {PlayerEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {
	CurrentCoinFlip,
	LocalCurrentCoinFlip,
	LocalGameState,
	LocalPlayerState,
} from 'common/types/game-state'
import {ModalData} from 'common/types/modal-requests'
import {
	LocalCardInstance,
	LocalModalData,
	LocalStatusEffectInstance,
	WithoutFunctions,
} from 'common/types/server-requests'
import {GameViewer} from '../game-controller'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

// Dear Reader,
// On 07/17/23, This still has not been sorted out properly. I think I might have
// even made it worse.
// Sincerely, Lunarmagpie

function getLocalStatusEffect(effect: StatusEffectComponent) {
	if (!effect.target) {
		return null
	}
	return {
		props: WithoutFunctions(effect.props),
		instance: effect.entity,
		target:
			effect.target instanceof CardComponent
				? {type: 'card', card: effect.target.entity}
				: {type: 'global', player: effect.target.entity},
		counter: effect.counter,
		description: effect.description,
	}
}

export function getLocalCard<CardType extends Card>(
	game: GameModel,
	card: CardComponent<CardType>,
): LocalCardInstance<CardType> {
	let attackPreview = null
	if (card.isSingleUse() && card.props.hasAttack && card.props.attackPreview) {
		attackPreview = card.props.attackPreview(game)
	}

	return {
		props: card.props as WithoutFunctions<CardType>,
		entity: card.entity,
		slot: card.slotEntity,
		turnedOver: card.turnedOver,
		prizeCard: card.prizeCard,
		attackHint: attackPreview,
	}
}

export function getLocalModalData(
	game: GameModel,
	modal: ModalData,
): LocalModalData {
	if (modal.type == 'selectCards') {
		return {
			...modal,
			cards: modal.cards.map((entity) =>
				getLocalCard(game, game.components.get(entity)!),
			),
		}
	} else if (modal.type == 'dragCards') {
		return {
			...modal,
			leftCards: modal.leftCards.map((entity) =>
				getLocalCard(game, game.components.get(entity)!),
			),
			rightCards: modal.rightCards.map((entity) =>
				getLocalCard(game, game.components.get(entity)!),
			),
		}
	} else if (modal.type === 'copyAttack') {
		let hermitCard = game.components.get(modal.hermitCard)!
		return {
			...modal,
			hermitCard: getLocalCard(game, hermitCard),
		}
	}

	throw new Error('Uknown modal type')
}

function getLocalCoinFlip(
	game: GameModel,
	coinFlip: CurrentCoinFlip,
): LocalCurrentCoinFlip {
	return {
		...coinFlip,
		card: getLocalCard(game, game.components.get(coinFlip.card)!),
	}
}

function getLocalPlayerState(
	game: GameModel,
	playerState: PlayerComponent,
	viewer: GameViewer,
): LocalPlayerState {
	let singleUseSlot = game.components.find(
		SlotComponent,
		query.slot.singleUse,
	)?.entity
	let singleUseCard = game.components.find(
		CardComponent,
		query.card.slotEntity(singleUseSlot),
	)

	if (!singleUseSlot) {
		throw new Error('Slot is missing when generating local game state.')
	}

	let board = {
		activeRow:
			game.components.findEntity(
				RowComponent,
				query.row.active,
				query.row.player(playerState.entity),
			) || null,
		singleUse: {
			slot: singleUseSlot,
			card: singleUseCard ? getLocalCard(game, singleUseCard) : null,
		},
		singleUseCardUsed: playerState.singleUseCardUsed,
		rows: game.components
			.filter(RowComponent, query.row.player(playerState.entity))
			.map((row) => {
				const hermitCard = row.getHermit()
				const hermitSlot = row.getHermitSlot()
				const attachCard = row.getAttach()
				const attachSlot = row.getAttachSlot()

				const items = row.getItemSlots(true).map((itemSlot) => {
					let itemCard = game.components.find(
						CardComponent,
						query.card.slotEntity(itemSlot.entity),
					)
					return {
						slot: itemSlot.entity,
						card: itemCard ? getLocalCard(game, itemCard) : null,
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
							card: hermitCard ? (getLocalCard(game, hermitCard) as any) : null,
						},
						attach: {
							slot: attachSlot.entity,
							card: attachCard ? (getLocalCard(game, attachCard) as any) : null,
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
		entity: playerState.entity,
		playerId: viewer?.player.id,
		playerName: playerState.playerName,
		minecraftName: playerState.minecraftName,
		censoredPlayerName: playerState.censoredPlayerName,
		coinFlips: playerState.coinFlips.map((flip) =>
			getLocalCoinFlip(game, flip),
		),
		lives: playerState.lives,
		board: board,
	}
	return localPlayerState
}

export function getLocalGameState(
	game: GameModel,
	viewer: GameViewer,
): LocalGameState {
	const playerState = game.components.find(
		PlayerComponent,
		(_game, player) => player.entity == viewer.playerOnLeft.entity,
	)

	if (!playerState)
		throw new Error('Player should be added to ECS before fetching local state')

	const opponentState = playerState.opponentPlayer

	let isCurrentPlayer =
		!viewer.spectator &&
		viewer.playerOnLeft.entity === game.currentPlayer.entity

	const turnState = game.state.turn

	// convert player states
	const players: Record<PlayerEntity, LocalPlayerState> = {}
	players[viewer.playerOnLeft.entity] = getLocalPlayerState(
		game,
		playerState,
		viewer,
	)
	players[viewer.playerOnRight.entity] = getLocalPlayerState(
		game,
		opponentState,
		viewer,
	)

	// Pick message or modal id
	playerState.pickableSlots = null
	let currentPickMessage = null
	let currentModalData = null

	const currentPickRequest = viewer.spectator
		? null
		: game.state.pickRequests[0]
	const currentModalRequest = viewer.spectator
		? null
		: game.state.modalRequests[0]

	if (currentModalRequest?.player === viewer.playerOnLeft.entity) {
		// We must send modal requests first, to stop pick requests from overwriting them.
		currentModalData = getLocalModalData(game, currentModalRequest.modal)
	} else if (currentPickRequest?.player === viewer.playerOnLeft.entity) {
		// Once there are no modal requests, send pick requests
		currentPickMessage = currentPickRequest.message
		// Add the card name before the request
		const pickRequestCreator = game.components.get(currentPickRequest.id)
		if (pickRequestCreator) {
			currentPickMessage = `${pickRequestCreator.props.name}: ${currentPickMessage}`
		}
		// We also want to highlight the slots for the player that must select a slot
		if (currentPickRequest.player == viewer.playerOnLeft.entity) {
			playerState.pickableSlots = game.getPickableSlots(
				currentPickRequest.canPick,
			)
		}
		// We also want to highlight the slots for the player that must select a slot
		if (currentPickRequest.player == viewer.playerOnLeft.entity) {
			playerState.pickableSlots = game.getPickableSlots(
				currentPickRequest.canPick,
			)
		}
	}

	let currentPickableSlots = playerState.pickableSlots

	let timer = {
		turnStartTime: game.state.timer.turnStartTime,
		opponentActionStartTime: game.state.timer.opponentActionStartTime,
		turnRemaining:
			game.state.timer.turnStartTime +
			999 +
			game.settings.maxTurnTime * 1000 -
			Date.now(),
	}

	const localGameState: LocalGameState = {
		isSpectator: viewer.spectator,
		turn: {
			turnNumber: turnState.turnNumber,
			currentPlayerEntity: game.currentPlayer.entity,
			availableActions: isCurrentPlayer
				? turnState.availableActions
				: turnState.opponentAvailableActions,
		},
		order: game.state.order,
		statusEffects: game.components
			.filter(StatusEffectComponent)
			.sort((a, b) => a.order - b.order)
			.map(getLocalStatusEffect)
			.filter((effect) => effect !== null) as Array<LocalStatusEffectInstance>,

		// personal info
		hand: viewer.spectator
			? []
			: game.components
					.filter(
						CardComponent,
						query.card.slot(
							query.slot.player(playerState.entity),
							query.slot.hand,
						),
					)
					.sort(CardComponent.compareOrder)
					.map((card) => getLocalCard(game, card)),
		pileCount: viewer.spectator
			? 0
			: game.components.filter(
					CardComponent,
					query.card.slot(
						query.slot.player(playerState.entity),
						query.slot.deck,
					),
				).length,
		discarded: viewer.spectator
			? []
			: game.components
					.filter(
						CardComponent,
						query.card.slot(
							query.slot.player(playerState.entity),
							query.slot.discardPile,
						),
					)
					.map((card) => getLocalCard(game, card)),

		// The entity of the player on the left of the screen
		playerEntity: players[viewer.playerOnLeft.entity].entity,
		// The entity for the player on the the right of the screen
		opponentPlayerEntity: players[viewer.playerOnRight.entity].entity,

		currentCardsCanBePlacedIn: playerState
			.getCardsCanBePlacedIn()
			.map(([card, place]) => [getLocalCard(game, card), place]),
		currentPickableSlots,
		currentPickMessage,
		currentModalData,

		players,
		timer,

		isBossGame: game.state.isBossGame,
		voiceLineQueue: game.voiceLineQueue,
	}

	return localGameState
}
