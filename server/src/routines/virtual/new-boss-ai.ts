import NewBoss, {
	BOSS_ATTACK,
	supplyBossAttack,
} from 'common/cards/boss/hermits/new_boss'
import {
	BoardSlotComponent,
	CardComponent,
	PlayerComponent,
	RowComponent,
	StatusEffectComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {PlayerEntity} from 'common/entities'
import {RowEntity} from 'common/entities'

const fireDropper = (game: GameModel) => {
	return Math.floor(game.rng() * 9)
}

// Helper function to find a hermit with the most health
function findHermitWithMostHealth(game: GameModel, playerEntity: PlayerEntity) {
	const rows = game.components.filter(
		RowComponent,
		query.row.player(playerEntity)
	)
	
	let maxHealth = 0
	let bestRow = null
	
	for (const row of rows) {
		if (row.health && row.health > maxHealth) {
			maxHealth = row.health
			bestRow = row
		}
	}
	
	return bestRow
}

// Helper function to find an empty item slot on a hermit
function findEmptyItemSlot(game: GameModel, playerEntity: PlayerEntity, rowEntity: RowEntity) {
	return game.components.find(
		SlotComponent,
		query.slot.player(playerEntity),
		query.slot.row(query.row.entity(rowEntity)),
		query.slot.empty,
		(_game, slot) => slot.type === 'item'
	)
}

// Helper function to find an empty effect slot on a hermit
function findEmptyEffectSlot(game: GameModel, playerEntity: PlayerEntity, rowEntity: RowEntity) {
	return game.components.find(
		SlotComponent,
		query.slot.player(playerEntity),
		query.slot.row(query.row.entity(rowEntity)),
		query.slot.empty,
		(_game, slot) => slot.type === 'attach'
	)
}

// Helper function to find a single-use card in hand
function findSingleUseCard(game: GameModel, playerEntity: PlayerEntity) {
	return game.components.find(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.hand),
		(_game, card) => card.props.category === 'single_use'
	)
}

// Helper function to find an item card in hand
function findItemCard(game: GameModel, playerEntity: PlayerEntity) {
	return game.components.find(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.hand),
		(_game, card) => card.props.category === 'item'
	)
}

// Helper function to find an effect card in hand
function findEffectCard(game: GameModel, playerEntity: PlayerEntity) {
	return game.components.find(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.hand),
		(_game, card) => card.props.category === 'attach'
	)
}

// Helper function to find a hermit card in hand
function findHermitCard(game: GameModel, playerEntity: PlayerEntity) {
	return game.components.find(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.hand),
		(_game, card) => card.props.category === 'hermit'
	)
}

// Helper function to find a random AFK hermit
function findRandomAfkHermit(game: GameModel, playerEntity: PlayerEntity) {
	const rows = game.components.filter(
		RowComponent,
		query.row.player(playerEntity),
		query.row.hasHermit,
		(_game, row) => row.entity !== game.components.get(playerEntity)?.activeRowEntity
	)
	
	if (rows.length === 0) return null
	
	const randomIndex = Math.floor(game.rng() * rows.length)
	return rows[randomIndex]
}

// Helper function to find an empty hermit slot
function findEmptyHermitSlot(game: GameModel, playerEntity: PlayerEntity) {
	return game.components.find(
		BoardSlotComponent,
		query.slot.player(playerEntity),
		query.slot.hermit,
		query.slot.empty
	)
}

// Helper function to place all hermits at the beginning of the game
function placeAllHermits(game: GameModel, playerEntity: PlayerEntity): AnyTurnActionData[] | null {
	// Find all hermit cards in hand
	const hermitCards = game.components.filter(
		CardComponent,
		query.card.player(playerEntity),
		query.card.slot(query.slot.hand),
		(_game, card) => card.props.category === 'hermit'
	)

	// Place each hermit card in an empty hermit slot
	for (const hermitCard of hermitCards) {
		const emptySlot = findEmptyHermitSlot(game, playerEntity)
		if (emptySlot) {
			return [{
				type: 'PLAY_HERMIT_CARD' as const,
				slot: emptySlot.entity,
				card: {
					id: hermitCard.props.numericId,
					entity: hermitCard.entity,
					slot: hermitCard.slotEntity,
					turnedOver: false,
					attackHint: null,
					prizeCard: false,
				},
			}]
		}
	}
	return null
}

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): Array<AnyTurnActionData> {
	const {player} = component
	const playerEntity = player.entity

	// Handle modal requests
	if (game.state.modalRequests.length) {
		if (['Allay', 'Lantern'].includes(game.state.modalRequests[0].modal.name)) {
			// Handles when challenger reveals card(s) to boss
			return [
				{
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				},
			]
		}
	}

	// Place all hermits at the beginning of the game
	if (game.state.turn.turnNumber === 1) {
		const hermitAction = placeAllHermits(game, playerEntity)
		if (hermitAction) return hermitAction
	}

	// Place boss card on turn 2
	if (game.state.turn.turnNumber === 2) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.player(playerEntity),
			query.card.is(NewBoss),
			query.card.slot(query.slot.hand),
		)
		const slot = game.components.findEntity(
			BoardSlotComponent,
			query.slot.player(playerEntity),
			query.slot.hermit,
		)
		if (bossCard && slot) {
			return [
				{
					type: 'PLAY_HERMIT_CARD',
					slot,
					card: {
						id: bossCard.props.numericId,
						entity: bossCard.entity,
						slot: bossCard.slotEntity,
						turnedOver: false,
						attackHint: null,
						prizeCard: false,
					},
				},
			]
		}
	}

	// Check if we have an active hermit
	const activeRow = player.activeRowEntity
	if (!activeRow) {
		// If no active hermit, find the one with most health and switch to it
		const bestRow = findHermitWithMostHealth(game, playerEntity)
		if (bestRow) {
			const hermitSlot = game.components.find(
				BoardSlotComponent,
				query.slot.player(playerEntity),
				query.slot.rowIs(bestRow.entity),
				query.slot.hermit
			)
			if (hermitSlot) {
				return [
					{
						type: 'CHANGE_ACTIVE_HERMIT',
						entity: hermitSlot.entity
					}
				]
			}
		}
		return [{type: 'END_TURN'}]
	}

	// Get the active row
	const activeRowComponent = game.components.get(activeRow)
	if (!activeRowComponent) return [{type: 'END_TURN'}]

	// Check if active hermit has less than 80 health
	if (activeRowComponent.health && activeRowComponent.health < 80) {
		// Find hermit with most health and switch to it
		const bestRow = findHermitWithMostHealth(game, playerEntity)
		if (bestRow && bestRow.entity !== activeRow) {
			const hermitSlot = game.components.find(
				BoardSlotComponent,
				query.slot.player(playerEntity),
				query.slot.rowIs(bestRow.entity),
				query.slot.hermit
			)
			if (hermitSlot) {
				return [
					{
						type: 'CHANGE_ACTIVE_HERMIT',
						entity: hermitSlot.entity
					},
					{type: 'END_TURN'}
				]
			}
		}
		return [{type: 'END_TURN'}]
	}

	// Try to play an item card on the active hermit
	const emptyItemSlot = findEmptyItemSlot(game, playerEntity, activeRow)
	if (emptyItemSlot) {
		const itemCard = game.components.find(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.hand),
			(_game, card) => card.props.category === 'item'
		)
		if (itemCard) {
			return [
				{
					type: 'PLAY_ITEM_CARD',
					slot: emptyItemSlot.entity,
					card: {
						id: itemCard.props.numericId,
						entity: itemCard.entity,
						slot: itemCard.slotEntity,
						turnedOver: false,
						attackHint: null,
						prizeCard: false,
					},
				}
			]
		}
	} else {
		// If active hermit has all item slots filled, try to give item to hermit with most health
		const itemCard = game.components.find(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.hand),
			(_game, card) => card.props.category === 'item'
		)
		if (itemCard) {
			const bestRow = findHermitWithMostHealth(game, playerEntity)
			if (bestRow && bestRow.entity !== activeRow) {
				const emptyItemSlot = findEmptyItemSlot(game, playerEntity, bestRow.entity)
				if (emptyItemSlot) {
					return [
						{
							type: 'PLAY_ITEM_CARD',
							slot: emptyItemSlot.entity,
							card: {
								id: itemCard.props.numericId,
								entity: itemCard.entity,
								slot: itemCard.slotEntity,
								turnedOver: false,
								attackHint: null,
								prizeCard: false,
							},
						}
					]
				}
			}
		}
	}

	// Try to play an effect card on the active hermit
	const emptyEffectSlot = findEmptyEffectSlot(game, playerEntity, activeRow)
	if (emptyEffectSlot) {
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.hand),
			(_game, card) => card.props.category === 'attach'
		)
		if (effectCard) {
			return [
				{
					type: 'PLAY_EFFECT_CARD',
					slot: emptyEffectSlot.entity,
					card: {
						id: effectCard.props.numericId,
						entity: effectCard.entity,
						slot: effectCard.slotEntity,
						turnedOver: false,
						attackHint: null,
						prizeCard: false,
					},
				}
			]
		}
	} else {
		// If active hermit has an effect card, try to play on a random AFK hermit
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(playerEntity),
			query.card.slot(query.slot.hand),
			(_game, card) => card.props.category === 'attach'
		)
		if (effectCard) {
			const afkRow = findRandomAfkHermit(game, playerEntity)
			if (afkRow) {
				const emptyEffectSlot = findEmptyEffectSlot(game, playerEntity, afkRow.entity)
				if (emptyEffectSlot) {
					return [
						{
							type: 'PLAY_EFFECT_CARD',
							slot: emptyEffectSlot.entity,
							card: {
								id: effectCard.props.numericId,
								entity: effectCard.entity,
								slot: effectCard.slotEntity,
								turnedOver: false,
								attackHint: null,
								prizeCard: false,
							},
						}
					]
				}
			}
		}
	}

	// Try to play a single-use card
	const singleUseCard = findSingleUseCard(game, playerEntity)
	if (singleUseCard && game.state.turn.availableActions.includes('PLAY_SINGLE_USE_CARD')) {
		const singleUseSlot = game.components.find(
			BoardSlotComponent,
			query.slot.player(playerEntity),
			query.slot.singleUse,
			query.slot.empty
		)
		if (singleUseSlot) {
			return [
				{
					type: 'PLAY_SINGLE_USE_CARD',
					slot: singleUseSlot.entity,
					card: {
						id: singleUseCard.props.numericId,
						entity: singleUseCard.entity,
						slot: singleUseCard.slotEntity,
						turnedOver: false,
						attackHint: null,
						prizeCard: false,
					},
				}
			]
		}
	}

	// Try to attack with secondary attack if possible
	if (game.state.turn.availableActions.includes('SECONDARY_ATTACK')) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit)
		)
		if (bossCard === null)
			throw new Error(`Boss's active hermit cannot be found, please report`)
		const bossAttack = getBossAttack(component.player, game)
		supplyBossAttack(bossCard, bossAttack)
		for (const sound of bossAttack) {
			game.voiceLineQueue.push(`/voice/${sound}.ogg`)
		}
		return [
			{type: 'DELAY', delay: bossAttack.length * 3000},
			{type: 'SECONDARY_ATTACK'},
			{type: 'END_TURN'}
		]
	}

	// Try to attack with primary attack if available
	if (game.state.turn.availableActions.includes('PRIMARY_ATTACK')) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit)
		)
		if (bossCard === null)
			throw new Error(`Boss's active hermit cannot be found, please report`)
		const bossAttack = getBossAttack(component.player, game)
		supplyBossAttack(bossCard, bossAttack)
		for (const sound of bossAttack) {
			game.voiceLineQueue.push(`/voice/${sound}.ogg`)
		}
		return [
			{type: 'DELAY', delay: bossAttack.length * 3000},
			{type: 'PRIMARY_ATTACK'},
			{type: 'END_TURN'}
		]
	}

	// Handle Nine effect
	const nineEffect = game.components.find(
		StatusEffectComponent,
		query.effect.is(ExBossNineEffect),
		query.effect.targetIsCardAnd(query.card.player(playerEntity))
	)
	if (nineEffect && nineEffect.counter === 0) {
		const nineSpecial = game.rng() > 0.5 ? 'NINEDISCARD' : 'NINEATTACHED'
		supplyNineSpecial(nineEffect, nineSpecial)
		game.voiceLineQueue.push(`/voice/${nineSpecial}.ogg`)
		return [{type: 'DELAY', delay: 10600}, {type: 'END_TURN'}]
	}

	// End turn if nothing else to do
	if (!game.state.turn.availableActions.includes('END_TURN'))
		throw new Error('Boss does not know what to do in this state, please report')

	return [{type: 'END_TURN'}]
}

function getBossAttack(player: PlayerComponent, game: GameModel): BOSS_ATTACK {
	const bossCard = game.components.find(
		CardComponent,
		query.card.currentPlayer,
		query.card.active,
		query.card.slot(query.slot.hermit)
	)
	if (!bossCard) throw new Error(`Boss's active hermit cannot be found, please report`)

	const nineEffect = game.components.find(
		StatusEffectComponent,
		query.effect.targetEntity(bossCard.entity),
		query.effect.is(ExBossNineEffect)
	)
	if (nineEffect) {
		supplyNineSpecial(nineEffect, 'NINEATTACHED')
		return ['90DMG', 'DOUBLE', 'EFFECTCARD']
	}

	const opponentActiveHermit = game.components.find(
		CardComponent,
		query.card.opponentPlayer,
		query.card.active,
		query.card.slot(query.slot.hermit)
	)
	if (!opponentActiveHermit) {
		return ['50DMG', 'AFK20', undefined]
	}

	const opponentRow = game.components.get(opponentActiveHermit.slot.entity)
	const opponentHealth = opponentRow instanceof RowComponent ? opponentRow.health ?? 0 : 0
	if (opponentHealth <= 50) {
		return ['50DMG', undefined, undefined]
	}

	const bossRow = game.components.get(bossCard.slot.entity)
	const bossHealth = bossRow instanceof RowComponent ? bossRow.health ?? 0 : 0
	if (bossHealth <= 150) {
		return ['70DMG', 'HEAL150', undefined]
	}

	return ['90DMG', 'ABLAZE', undefined]
}

const NewBossAI: VirtualAI = {
	id: 'new_boss',

	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}

export default NewBossAI 