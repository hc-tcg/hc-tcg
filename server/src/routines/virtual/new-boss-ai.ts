import Totem from 'common/cards/attach/totem'
import {attach} from 'common/cards/defaults'
import {
	BoardSlotComponent,
	CardComponent,
	RowComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {
	AnyTurnActionData,
	AttackActionData,
} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {getLocalCard} from '../../utils/state-gen'

/** Sorts `BoardSlotComponent`s by active row first then descending row health */
const compareBoardSlots = (
	a: BoardSlotComponent,
	b: BoardSlotComponent,
): number => {
	if (a.rowEntity === b.rowEntity) return 0
	if (a.inRow() && b.inRow()) {
		const aIsActive = a.rowEntity === a.player.activeRowEntity
		const bIsActive = b.player.activeRowEntity === b.rowEntity
		if (aIsActive || bIsActive) return Number(aIsActive) - Number(bIsActive)
		return (b.row.health || 0) - (a.row.health || 0)
	}
	return 0
}

const getAvailableEnergy = (row: RowComponent) => {
	const {player} = row

	let energy = row
		.getItems()
		.flatMap((card) => (card.isItem() ? card.props.energy : []))

	const activeRowEntity = player.activeRowEntity
	player.activeRowEntity = row.entity
	energy = player.hooks.availableEnergy.call(energy)
	player.activeRowEntity = activeRowEntity
	return energy
}

const cardIsPlayable = (game: GameModel, card: CardComponent): boolean =>
	game.components.exists(SlotComponent, card.props.attachCondition)

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): AnyTurnActionData {
	const {player} = component

	const availableActions = component.availableActions.slice()

	// Log available actions for debugging
	console.log('New Boss AI - Available actions:', availableActions)

	// Log information about hermits on the board
	const hermitsOnBoard = game.components.filter(
		BoardSlotComponent,
		query.slot.player(player.entity),
		query.slot.hermit,
		query.not(query.slot.empty),
	)

	const activeHermit = player.getActiveHermit()

	console.log(
		`New Boss AI - Hermits on board: ${hermitsOnBoard.length}, Active hermit: ${activeHermit ? 'Yes' : 'No'}`,
	)

	// Check if we have no active hermit but have AFK hermits
	// This could happen if our active hermit was just knocked out
	// SMART: Switch to most turns alive vs. current hermit (/+damage SU conditional) / quickest KO, has enough energy to attack / [variants] key hermits.
	if (
		!activeHermit &&
		hermitsOnBoard.length > 0 &&
		availableActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		console.log(
			'New Boss AI - No active hermit found, switching to hermit with most health',
		)

		// Find the hermit with the most health
		let bestHermit = game.components
			.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
				query.not(query.slot.empty),
			)
			.sort(compareBoardSlots)
			.at(0)

		if (bestHermit) {
			let bestHealth = bestHermit.row?.health
			console.log(`New Boss AI - Switching to hermit with ${bestHealth} health`)

			return {
				type: 'CHANGE_ACTIVE_HERMIT',
				entity: bestHermit.entity,
			}
		} else {
			console.log('New Boss AI - No valid hermits found to switch to')

			// If we have no valid hermits to switch to, end the turn to avoid getting stuck
			if (availableActions.includes('END_TURN')) {
				console.log(
					'New Boss AI - Ending turn since no valid hermits to switch to',
				)
				return {type: 'END_TURN'}
			}
		}
	}

	// Log if we have multiple hermits but CHANGE_ACTIVE_HERMIT isn't available
	if (
		hermitsOnBoard.length > 1 &&
		!availableActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		console.log(
			'New Boss AI - WARNING: Multiple hermits on board but CHANGE_ACTIVE_HERMIT not available!',
		)
		console.log('New Boss AI - Blocked actions:', game.getAllBlockedActions())
	}

	console.log(
		'New Boss AI - Cards in hand:',
		player
			.getHand()
			.map(
				(card) =>
					`${card.props.id} (${card.isHermit() ? 'Hermit' : card.isAttach() ? 'Effect' : card.isItem() ? 'Item' : 'SingleUse'})`,
			),
	)

	// Handle pick requests - this must be checked before modal requests
	if (game.state.pickRequests.length > 0) {
		console.log('New Boss AI - Handling pick request')

		// Find a valid slot to pick based on the pick request's canPick query
		// SMART: Check what request it is and respond accordingly.
		const validSlot = game.components.find(
			SlotComponent,
			game.state.pickRequests[0].canPick,
		)

		if (validSlot) {
			console.log(
				'New Boss AI - Found valid slot for pick request:',
				validSlot.entity,
			)
			return {
				type: 'PICK_REQUEST',
				entity: validSlot.entity,
			}
		} else {
			console.log('New Boss AI - No valid slot found for pick request')
		}
	}

	if (game.state.modalRequests.length) {
		const modalRequest = game.state.modalRequests[0]
		console.log(
			'New Boss AI - Handling modal request:',
			modalRequest.modal.name,
		)

		// Handle confirmation modals for single-use cards
		if (
			modalRequest.modal.type === 'selectCards' &&
			modalRequest.modal.name.includes('Confirm')
		) {
			console.log('New Boss AI - Confirming single-use card action')
			return {
				type: 'MODAL_REQUEST',
				modalResult: {result: true, cards: null},
			}
		}

		// Handle copyAttack modals (like Cleo's puppetry)
		if (modalRequest.modal.type === 'copyAttack') {
			console.log('New Boss AI - Handling copyAttack modal')
			// Randomly choose between primary and secondary attack
			// SMART: Evaluate positions.
			const availableAttacks = modalRequest.modal.availableAttacks
			if (availableAttacks.length > 0) {
				const randomIndex = Math.floor(Math.random() * availableAttacks.length)
				const selectedAttack = availableAttacks[randomIndex]
				console.log(`New Boss AI - Randomly selected ${selectedAttack} attack`)
				return {
					type: 'MODAL_REQUEST',
					modalResult: {pick: selectedAttack},
				}
			} else {
				console.log('New Boss AI - No available attacks, canceling')
				return {
					type: 'MODAL_REQUEST',
					modalResult: {cancel: true},
				}
			}
		}

		// Handle selectCards modals
		if (modalRequest.modal.type === 'selectCards') {
			console.log('New Boss AI - Handling selectCards modal')
			const selectionSize = modalRequest.modal.selectionSize

			// If no selection needed, just confirm
			// SMART: At least make it handle spyglass(simplest: token cost), chest, HHH, and say yes for Grian - Borrow.
			if (selectionSize === 0) {
				console.log('New Boss AI - No selection needed, confirming')
				return {
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				}
			}

			// If selection needed, randomly select cards
			const cards = modalRequest.modal.cards
			if (cards && cards.length > 0) {
				// Determine how many cards to select
				let numToSelect = 0
				if (typeof selectionSize === 'number') {
					numToSelect = selectionSize
				} else if (Array.isArray(selectionSize)) {
					// If it's a range, pick a random number in that range
					const [min, max] = selectionSize
					numToSelect = Math.floor(Math.random() * (max - min + 1)) + min
				}

				// Limit to available cards
				numToSelect = Math.min(numToSelect, cards.length)

				if (numToSelect > 0) {
					// Randomly select cards
					const selectedCards = []
					const shuffled = [...cards].sort(() => 0.5 - Math.random())
					for (let i = 0; i < numToSelect; i++) {
						selectedCards.push(shuffled[i])
					}

					console.log(
						`New Boss AI - Randomly selected ${selectedCards.length} cards`,
					)
					return {
						type: 'MODAL_REQUEST',
						modalResult: {result: true, cards: selectedCards},
					}
				}
			}

			// If we couldn't select cards, just confirm without selection
			console.log(
				'New Boss AI - Could not select cards, confirming without selection',
			)
			return {
				type: 'MODAL_REQUEST',
				modalResult: {result: true, cards: null},
			}
		}

		// Handle dragCards modals
		if (modalRequest.modal.type === 'dragCards') {
			console.log('New Boss AI - Handling dragCards modal')
			// For drag cards, we'll just return the cards as they are
			// This is a simple approach that should work for most cases
			// SMART: I think there's just Brush rn and it's gonna be a lot of work for one specific case.
			return {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: true,
					leftCards: modalRequest.modal.leftCards,
					rightCards: modalRequest.modal.rightCards,
				},
			}
		}

		// Default case - just confirm any modal
		console.log('New Boss AI - Using default handling for modal request')
		return {
			type: 'MODAL_REQUEST',
			modalResult: {result: true, cards: null},
		}
	}

	// Handle changing active hermit if needed
	if (availableActions.includes('CHANGE_ACTIVE_HERMIT')) {
		console.log('New Boss AI - Attempting to change active hermit')

		// Check if current active hermit has low health (less than 90)
		// SMART: Detect 1HKO instead of hp. (/+SU conditional)
		const activeHealth = player.activeRow?.health || 0
		console.log('New Boss AI - Current active hermit health:', activeHealth)

		// If active hermit has less than 90 health, try to switch to a healthier one
		// SMART: DON'T, THERE ARE ONLY SELECT CASES WHERE YOU WANT TO DO THIS OUTSIDE OF LAST LIFE.
		// Q: Cant' we combine the functions with the previous one?
		if (
			activeHealth < 90 &&
			player.activeRow?.getAttach()?.props.id !== Totem.id
		) {
			// Find another row that has a hermit with more health
			const bestHermit = game.components
				.filter(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.hermit,
					query.not(query.slot.empty),
					query.not(query.slot.active),
				)
				.sort(compareBoardSlots)
				.at(0)
			const bestHealth = bestHermit?.row?.health || 0
			if (bestHermit && bestHealth > activeHealth) {
				console.log('New Boss AI - Changing to hermit with health:', bestHealth)
				return {
					type: 'CHANGE_ACTIVE_HERMIT',
					entity: bestHermit.entity,
				}
			}
		}
	}

	// Check if we need to play a hermit card - highest priority
	if (availableActions.includes('PLAY_HERMIT_CARD')) {
		// First check for a hermit card in hand
		const hermitCards = game.components.filter(
			CardComponent,
			query.card.player(player.entity),
			query.card.isHermit,
			query.card.slot(query.slot.hand),
		)

		// Count how many hermits are already on the board
		const hermitsOnBoard = game.components.filter(
			BoardSlotComponent,
			query.slot.player(player.entity),
			query.slot.hermit,
			query.not(query.slot.empty),
		)

		if (hermitCards.length > 0) {
			// Find all empty hermit slots where we can place hermits
			// SMART: Look for AFK damage possibilities (i.e. Hotguy's on the oppoenet's board and it's not in our deck / Bow or corssbow played before.)
			const emptyHermitSlots = game.components.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
				query.slot.empty,
			)

			if (emptyHermitSlots.length > 0) {
				// Log the hermit card and where we're placing it
				console.log(
					`New Boss AI - Playing hermit card: ${hermitCards[0].props.id} (${emptyHermitSlots.length} empty slots, ${hermitsOnBoard.length} hermits already on board)`,
				)

				// Randomly select an empty slot
				// SMART: (Variant only) If we have armor, try to space the key the key hermits. If Piston/Ladder, place them adjacently or according to preplanned formation.
				const randomIndex = Math.floor(game.rng() * emptyHermitSlots.length)
				const targetSlot = emptyHermitSlots[randomIndex]

				return {
					type: 'PLAY_HERMIT_CARD',
					slot: targetSlot.entity,
					card: getLocalCard(game, hermitCards[0]),
				}
			}
		}
	}

	// Try to play single use cards
	if (availableActions.includes('PLAY_SINGLE_USE_CARD')) {
		// We need to find the single use slot
		const singleUseSlot = game.components.find(
			BoardSlotComponent,
			query.slot.singleUse,
		)

		//SMART: If critical situaltion, draw. If it will make you KO, play. If playing they will make you last extra turns, play. If you're not low on cards, draw.
		if (singleUseSlot) {
			const singleUseCard = game.components.find(
				CardComponent,
				query.card.player(player.entity),
				query.card.isSingleUse,
				query.card.slot(query.slot.hand),
				(game, card) => card.props.attachCondition(game, singleUseSlot),
			)
			if (singleUseCard) {
				console.log(
					'New Boss AI - Playing single use card:',
					singleUseCard.props.id,
				)

				// Return just the play card action - the confirmation modal will be handled separately
				// Don't include END_TURN here as we need to wait for confirmation
				return {
					type: 'PLAY_SINGLE_USE_CARD',
					slot: singleUseSlot.entity,
					card: getLocalCard(game, singleUseCard),
				}
			}
		}
	}

	if (availableActions.includes('APPLY_EFFECT')) {
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			query.card.isSingleUse,
			query.card.slot(query.slot.singleUse),
		)
		if (effectCard && !player.singleUseCardUsed) {
			console.log(
				'New Boss AI - Found effect card to play:',
				effectCard.props.id,
			)
			return {type: 'APPLY_EFFECT'}
		} else {
			console.log(
				'New Boss AI - Not applying effect - already used or no card found',
			)
		}
	}

	// Try to play attach effect cards
	// SMART: Prioritize better effects for key hermits for variants, attach Water to burned hermits if there are no other effects to play / Milk etc, Chainmail et al for anti-snipe, [advanced] TFC removal sacrifice.
	//        TLDR: Evaluate for major situations. (There's a lot)
	if (availableActions.includes('PLAY_EFFECT_CARD')) {
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			query.card.isAttach,
			query.card.slot(query.slot.hand),
			(game, card) =>
				game.components.exists(
					SlotComponent,
					card.props.attachCondition,
					attach.attachCondition,
				),
		)

		if (effectCard) {
			console.log(
				'New Boss AI - Found effect card to play:',
				effectCard.props.id,
			)

			const targetAttachSlot = game.components
				.filter(
					BoardSlotComponent,
					effectCard.props.attachCondition,
					attach.attachCondition,
				)
				.sort(compareBoardSlots)
				.at(0)?.entity

			if (targetAttachSlot) {
				console.log('New Boss AI - Playing effect card on selected attach slot')
				return {
					type: 'PLAY_EFFECT_CARD',
					slot: targetAttachSlot,
					card: getLocalCard(game, effectCard),
				}
			} else {
				console.log('New Boss AI - No empty attach slot found for effect card')
			}
		}
	}

	// Try to play item cards
	if (availableActions.includes('PLAY_ITEM_CARD'))
		playItemCard: {
			const itemCard = game.components.find(
				CardComponent,
				query.card.player(player.entity),
				query.card.isItem,
				query.card.slot(query.slot.hand),
				cardIsPlayable,
			)

			// SMART: Make basic item card checks before playing SU.
			if (!itemCard) break playItemCard
			console.log('New Boss AI - Found item card to play:', itemCard.props.id)

			// Check if any hermits need items

			// Check all hermits on the board
			const filteredItemSlots = game.components
				.filter(RowComponent, query.row.player(player.entity))
				.flatMap((row) => {
					// Check if row has a Hermit
					const hermit = row.getHermit()
					if (!hermit?.isHermit()) return []
					// Check if row has an empty item slot
					const emptyItemSlot = row.itemSlots.find((slot) => !slot.cardEntity)
					if (!emptyItemSlot) return []
					// Check if hermit needs more energy to use their secondary attack
					if (
						hasEnoughEnergy(
							getAvailableEnergy(row),
							hermit.getAttackCost('secondary'),
							game.settings.noItemRequirements,
						)
					)
						return []
					return [emptyItemSlot]
				})

			// Only skip playing items if there are no empty item slots at all
			// SMART: NO, WHEN ALL HERMITS HAVE SUFFICIENT ITEMS. [advanced] Lead/Hypno/Elder Guardian-related deep plays.
			if (filteredItemSlots.length === 0) {
				console.log(
					'New Boss AI - No empty item slots available, skipping item card play',
				)
				break playItemCard
			}

			const targetItemSlot = filteredItemSlots
				.sort(compareBoardSlots)
				.at(0)?.entity

			if (targetItemSlot) {
				console.log('New Boss AI - Playing item card on selected item slot')
				return {
					type: 'PLAY_ITEM_CARD',
					slot: targetItemSlot,
					card: getLocalCard(game, itemCard),
				}
			} else {
				console.log('New Boss AI - No empty item slot found for item card')
			}
		}

	// Attack only after we've played all possible cards - lowest priority
	// SMART: Don't attack if it makes you lose.
	const attackType = availableActions.find(
		(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
	)

	// Add detailed logging for attack availability
	console.log('New Boss AI - Attack availability check:')
	console.log('Available actions:', availableActions)
	console.log('Attack type available:', attackType)

	if (attackType) {
		const bossCard = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit),
		)

		console.log('Active hermit found:', bossCard ? bossCard.props.id : 'None')

		if (bossCard === null) {
			console.error(
				"New Boss AI - ERROR: Boss's active hermit cannot be found!",
			)
			throw new Error(`Boss's active hermit cannot be found, please report`)
		}

		// Check if both attack types are available and prioritize secondary attack
		// SMART: Consider cases of H!Cleo, Jopacity, Sheep Stare and Amnesia.
		let selectedAttackType = attackType
		if (availableActions.includes('SECONDARY_ATTACK')) {
			console.log(
				'New Boss AI - Both attack types available, prioritizing secondary attack',
			)
			selectedAttackType = 'SECONDARY_ATTACK'
		} else {
			console.log(
				'New Boss AI - Using primary attack (secondary not available)',
			)
		}

		console.log(
			'New Boss AI - FINAL ACTION: Performing attack with hermit:',
			bossCard.props.id,
		)

		return {
			type: selectedAttackType,
		} satisfies AttackActionData
	} else {
		console.log(
			'New Boss AI - No attack action available. Available actions:',
			availableActions,
		)
	}

	// Only try to end turn if END_TURN is available
	if (availableActions.includes('END_TURN')) {
		console.log('New Boss AI - Ending turn')
		return {type: 'END_TURN'}
	} else {
		// If END_TURN is not available, return an empty array to let the game continue
		console.log('New Boss AI - END_TURN not available, throwing error')
		throw new Error('AI does not know what to do in this state, please report')
	}
}

const NewBossAI: VirtualAI = {
	id: 'new_boss',

	getTurnActions: function* (game, component) {
		while (true) {
			yield getNextTurnAction(game, component)
		}
	},
}

export default NewBossAI
