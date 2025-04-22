import {
	BoardSlotComponent,
	CardComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'

// Track the last time we checked for available actions
let lastActionCheckTime = 0

// Helper function to check if we have enough energy for an attack
const hasEnoughEnergy = (
	currentEnergy: Array<string>,
	requiredEnergy: Array<string>,
	noRequirements: boolean,
): boolean => {
	if (noRequirements) return true
	if (!requiredEnergy || requiredEnergy.length === 0) return true

	const availableEnergy = [...currentEnergy]
	for (const energy of requiredEnergy) {
		const index = availableEnergy.indexOf(energy)
		if (index === -1) return false
		availableEnergy.splice(index, 1)
	}
	return true
}

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): Array<AnyTurnActionData> {
	const {player} = component

	// Log available actions for debugging
	console.log(
		'New Boss AI - Available actions:',
		game.state.turn.availableActions,
	)

	// Log information about hermits on the board
	const hermitsOnBoard = game.components.filter(
		BoardSlotComponent,
		query.slot.player(player.entity),
		query.slot.hermit,
		query.not(query.slot.empty),
	)

	const activeHermit = game.components.find(
		BoardSlotComponent,
		query.slot.player(player.entity),
		query.slot.hermit,
		query.slot.active,
	)

	console.log(
		`New Boss AI - Hermits on board: ${hermitsOnBoard.length}, Active hermit: ${activeHermit ? 'Yes' : 'No'}`,
	)

	// Check if we have no active hermit but have AFK hermits
	// This could happen if our active hermit was just knocked out
	if (!activeHermit && hermitsOnBoard.length > 0) {
		console.log(
			'New Boss AI - No active hermit found, switching to hermit with most health',
		)

		// Find the hermit with the most health
		let bestHermit = null
		let bestHealth = -1

		for (const slot of hermitsOnBoard) {
			// Skip slots that are not in a row or have null health (knocked out)
			if (!slot.inRow() || slot.row.health === null) {
				continue
			}

			const health = slot.row.health || 0
			if (health > bestHealth) {
				bestHealth = health
				bestHermit = slot
			}
		}

		if (bestHermit) {
			console.log(`New Boss AI - Switching to hermit with ${bestHealth} health`)

			// Force unblock the CHANGE_ACTIVE_HERMIT action if it's blocked
			if (!game.state.turn.availableActions.includes('CHANGE_ACTIVE_HERMIT')) {
				console.log(
					'New Boss AI - CHANGE_ACTIVE_HERMIT action is blocked, unblocking it',
				)
				game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
				game.state.turn.availableActions.push('CHANGE_ACTIVE_HERMIT')
			}

			return [
				{
					type: 'CHANGE_ACTIVE_HERMIT',
					entity: bestHermit.entity,
				},
			]
		} else {
			console.log('New Boss AI - No valid hermits found to switch to')

			// If we have no valid hermits to switch to, end the turn to avoid getting stuck
			if (game.state.turn.availableActions.includes('END_TURN')) {
				console.log(
					'New Boss AI - Ending turn since no valid hermits to switch to',
				)
				return [{type: 'END_TURN'}]
			}
		}
	}

	// Log if we have multiple hermits but CHANGE_ACTIVE_HERMIT isn't available
	if (
		hermitsOnBoard.length > 1 &&
		!game.state.turn.availableActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		console.log(
			'New Boss AI - WARNING: Multiple hermits on board but CHANGE_ACTIVE_HERMIT not available!',
		)
		console.log('New Boss AI - Blocked actions:', game.getAllBlockedActions())
	}

	console.log(
		'New Boss AI - Cards in hand:',
		game.components
			.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
			)
			.map(
				(card) =>
					`${card.props.id} (${card.isHermit() ? 'Hermit' : card.isAttach() ? 'Effect' : card.isItem() ? 'Item' : 'SingleUse'})`,
			),
	)

	// Handle pick requests - this must be checked before modal requests
	if (game.state.pickRequests.length > 0) {
		console.log('New Boss AI - Handling pick request')
		const pickRequest = game.state.pickRequests[0]
		if (!pickRequest) return []

		// Find a valid slot to pick based on the pick request's canPick query
		const validSlot = game.components.find(SlotComponent, pickRequest.canPick)

		if (validSlot) {
			console.log(
				'New Boss AI - Found valid slot for pick request:',
				validSlot.entity,
			)
			return [
				{
					type: 'PICK_REQUEST',
					entity: validSlot.entity,
				},
			]
		} else {
			console.log('New Boss AI - No valid slot found for pick request')
			return []
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
			return [
				{
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				},
			]
		}

		// Handle copyAttack modals (like Cleo's puppetry)
		if (modalRequest.modal.type === 'copyAttack') {
			console.log('New Boss AI - Handling copyAttack modal')
			// Randomly choose between primary and secondary attack
			const availableAttacks = modalRequest.modal.availableAttacks
			if (availableAttacks.length > 0) {
				const randomIndex = Math.floor(Math.random() * availableAttacks.length)
				const selectedAttack = availableAttacks[randomIndex]
				console.log(`New Boss AI - Randomly selected ${selectedAttack} attack`)
				return [
					{
						type: 'MODAL_REQUEST',
						modalResult: {pick: selectedAttack},
					},
				]
			} else {
				console.log('New Boss AI - No available attacks, canceling')
				return [
					{
						type: 'MODAL_REQUEST',
						modalResult: {cancel: true},
					},
				]
			}
		}

		// Handle selectCards modals
		if (modalRequest.modal.type === 'selectCards') {
			console.log('New Boss AI - Handling selectCards modal')
			const selectionSize = modalRequest.modal.selectionSize

			// If no selection needed, just confirm
			if (selectionSize === 0) {
				console.log('New Boss AI - No selection needed, confirming')
				return [
					{
						type: 'MODAL_REQUEST',
						modalResult: {result: true, cards: null},
					},
				]
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
					return [
						{
							type: 'MODAL_REQUEST',
							modalResult: {result: true, cards: selectedCards},
						},
					]
				}
			}

			// If we couldn't select cards, just confirm without selection
			console.log(
				'New Boss AI - Could not select cards, confirming without selection',
			)
			return [
				{
					type: 'MODAL_REQUEST',
					modalResult: {result: true, cards: null},
				},
			]
		}

		// Handle dragCards modals
		if (modalRequest.modal.type === 'dragCards') {
			console.log('New Boss AI - Handling dragCards modal')
			// For drag cards, we'll just return the cards as they are
			// This is a simple approach that should work for most cases
			return [
				{
					type: 'MODAL_REQUEST',
					modalResult: {
						result: true,
						leftCards: modalRequest.modal.leftCards,
						rightCards: modalRequest.modal.rightCards,
					},
				},
			]
		}

		// Default case - just confirm any modal
		console.log('New Boss AI - Using default handling for modal request')
		return [
			{
				type: 'MODAL_REQUEST',
				modalResult: {result: true, cards: null},
			},
		]
	}

	// Handle changing active hermit if needed
	if (game.state.turn.availableActions.includes('CHANGE_ACTIVE_HERMIT')) {
		console.log('New Boss AI - Attempting to change active hermit')

		// Check if current active hermit has low health (less than 90)
		const activeHermit = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit),
		)

		if (activeHermit && activeHermit.slot.inRow()) {
			const activeHealth = activeHermit.slot.row.health || 0
			console.log('New Boss AI - Current active hermit health:', activeHealth)

			// If active hermit has less than 90 health, try to switch to a healthier one
			if (activeHealth < 90) {
				// Find another row that has a hermit with more health
				const hermitSlots = game.components.filter(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.hermit,
					query.not(query.slot.empty),
					query.not(query.slot.active),
				)

				if (hermitSlots.length > 0) {
					// Prioritize hermits with higher health if available
					let bestSlot = hermitSlots[0]
					let bestHealth = bestSlot.inRow() ? bestSlot.row.health || 0 : 0

					for (const slot of hermitSlots) {
						const health = slot.inRow() ? slot.row.health || 0 : 0
						if (health > bestHealth) {
							bestHealth = health
							bestSlot = slot
						}
					}

					// Only switch if the new hermit has more health than the current one
					if (bestHealth > activeHealth) {
						console.log(
							'New Boss AI - Changing to hermit with health:',
							bestHealth,
						)
						return [
							{
								type: 'CHANGE_ACTIVE_HERMIT',
								entity: bestSlot.entity,
							},
						]
					}
				}
			}
		}
	}

	// Check if we need to play a hermit card - highest priority
	if (game.state.turn.availableActions.includes('PLAY_HERMIT_CARD')) {
		// First check for a hermit card in hand
		const hermitCards = game.components.filter(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.isHermit(),
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
				const randomIndex = Math.floor(game.rng() * emptyHermitSlots.length)
				const targetSlot = emptyHermitSlots[randomIndex]

				return [
					{
						type: 'PLAY_HERMIT_CARD',
						slot: targetSlot.entity,
						card: {
							id: hermitCards[0].props.numericId,
							entity: hermitCards[0].entity,
							slot: hermitCards[0].slotEntity,
							turnedOver: false,
							attackHint: null,
							prizeCard: false,
						},
					},
				]
			}
		}
	}

	// Try to play single use cards
	if (game.state.turn.availableActions.includes('PLAY_SINGLE_USE_CARD')) {
		const singleUseCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.isSingleUse(),
			query.card.slot(query.slot.hand),
		)

		if (singleUseCard) {
			// We need to find the single use slot
			const singleUseSlot = game.components.find(
				BoardSlotComponent,
				query.slot.player(player.entity),
				(_game, slot) => slot.type === 'single_use',
			)

			if (singleUseSlot) {
				console.log(
					'New Boss AI - Playing single use card:',
					singleUseCard.props.id,
				)

				// Return just the play card action - the confirmation modal will be handled separately
				// Don't include END_TURN here as we need to wait for confirmation
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
					},
				]
			}
		}
	}

	if (game.state.turn.availableActions.includes('APPLY_EFFECT')) {
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.isSingleUse(),
			query.card.slot(query.slot.singleUse),
		)
		if (effectCard && !player.singleUseCardUsed) {
			console.log(
				'New Boss AI - Found effect card to play:',
				effectCard.props.id,
			)
			return [{type: 'APPLY_EFFECT'}]
		} else {
			console.log(
				'New Boss AI - Not applying effect - already used or no card found',
			)
		}
	}

	// Try to play effect cards
	if (game.state.turn.availableActions.includes('PLAY_EFFECT_CARD')) {
		const effectCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.isAttach(),
			query.card.slot(query.slot.hand),
		)

		if (effectCard) {
			console.log(
				'New Boss AI - Found effect card to play:',
				effectCard.props.id,
			)

			// Find active hermit first
			const activeHermit = game.components.find(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
				query.slot.active,
				query.not(query.slot.empty),
			)

			let targetAttachSlot = null

			// First try to find an empty attach slot for the active hermit
			if (activeHermit && activeHermit.inRow()) {
				console.log(
					'New Boss AI - Checking if active hermit has empty attach slots',
				)

				const activeRow = activeHermit.row
				const attachSlot = game.components.find(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.attach,
					query.slot.empty,
					(game, slot) => slot.inRow() && slot.rowEntity === activeRow.entity,
				)

				if (attachSlot) {
					console.log('New Boss AI - Found empty attach slot for active hermit')
					targetAttachSlot = attachSlot.entity
				} else {
					console.log('New Boss AI - Active hermit has no empty attach slots')
				}
			}

			// If active hermit has no empty attach slots, find hermit with most health and free slots
			if (!targetAttachSlot) {
				console.log(
					'New Boss AI - Looking for hermit with most health and free attach slots',
				)

				// Find all hermits on the board
				const hermitSlots = game.components.filter(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.hermit,
					query.not(query.slot.empty),
				)

				// Find the hermit with the most health that has empty attach slots
				let bestHermit = null
				let bestHealth = -1

				for (const hermitSlot of hermitSlots) {
					// Skip if not in a row or health is null
					if (!hermitSlot.inRow() || hermitSlot.row.health === null) {
						continue
					}

					const health = hermitSlot.row.health || 0
					const row = hermitSlot.row

					// Check if this hermit's row has an empty attach slot
					const attachSlot = game.components.find(
						BoardSlotComponent,
						query.slot.player(player.entity),
						query.slot.attach,
						query.slot.empty,
						(game, slot) => slot.inRow() && slot.rowEntity === row.entity,
					)

					if (attachSlot && health > bestHealth) {
						bestHealth = health
						bestHermit = hermitSlot
						targetAttachSlot = attachSlot.entity
					}
				}

				if (targetAttachSlot) {
					console.log(
						`New Boss AI - Found hermit with ${bestHealth} health and empty attach slot`,
					)
				} else {
					console.log('New Boss AI - No hermits with empty attach slots found')

					// Fallback to any empty attach slot if no hermit-specific slots are found
					const anyAttachSlot = game.components.findEntity(
						BoardSlotComponent,
						query.slot.player(player.entity),
						query.slot.attach,
						query.slot.empty,
					)

					if (anyAttachSlot) {
						targetAttachSlot = anyAttachSlot
					}
				}
			}

			if (targetAttachSlot) {
				console.log('New Boss AI - Playing effect card on selected attach slot')
				return [
					{
						type: 'PLAY_EFFECT_CARD',
						slot: targetAttachSlot,
						card: {
							id: effectCard.props.numericId,
							entity: effectCard.entity,
							slot: effectCard.slotEntity,
							turnedOver: false,
							attackHint: null,
							prizeCard: false,
						},
					},
				]
			} else {
				console.log('New Boss AI - No empty attach slot found for effect card')
			}
		}
	}

	// Try to play item cards
	if (game.state.turn.availableActions.includes('PLAY_ITEM_CARD')) {
		const itemCard = game.components.find(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => card.isItem(),
			query.card.slot(query.slot.hand),
		)

		if (itemCard) {
			console.log('New Boss AI - Found item card to play:', itemCard.props.id)

			// First check if any hermits need items
			let anyHermitNeedsItems = false

			// Check all hermits on the board
			const allHermitSlots = game.components.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
				query.not(query.slot.empty),
			)

			for (const hermitSlot of allHermitSlots) {
				if (!hermitSlot.inRow() || hermitSlot.row.health === null) {
					continue
				}

				const row = hermitSlot.row
				const hermitCard = row.getHermit()

				if (hermitCard && hermitCard.isHermit()) {
					const currentItems = game.components.filter(
						CardComponent,
						query.card.slot(query.slot.item),
						query.card.rowEntity(row.entity),
					)
					const currentEnergy = currentItems.flatMap(
						(item) => (item.props as any).energy || [],
					)
					const requiredEnergy = hermitCard.getAttackCost('secondary')

					if (
						!hasEnoughEnergy(
							currentEnergy,
							requiredEnergy,
							game.settings.noItemRequirements,
						)
					) {
						anyHermitNeedsItems = true
						break
					}
				}
			}

			if (!anyHermitNeedsItems) {
				console.log(
					'New Boss AI - No hermits need items, skipping item card play',
				)
				// Skip playing the item card since no hermits need items
				return []
			}

			// Find active hermit first
			let activeHermit: BoardSlotComponent | null = game.components.find(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
				query.slot.active,
				query.not(query.slot.empty),
			)

			let targetItemSlot: string | null = null
			let activeHermitNeedsItems = false
			let activeHermitRowEntity: string | null = null

			// Check if the active hermit needs items and has empty slots
			if (activeHermit && activeHermit.inRow()) {
				activeHermitRowEntity = activeHermit.rowEntity
				console.log('New Boss AI - Checking if active hermit needs items')
				const activeRow = activeHermit.row
				const hermitCard = activeRow.getHermit()

				if (hermitCard && hermitCard.isHermit()) {
					const currentItems = game.components.filter(
						CardComponent,
						query.card.slot(query.slot.item),
						query.card.rowEntity(activeRow.entity),
					)
					const currentEnergy = currentItems.flatMap(
						(item) => (item.props as any).energy || [],
					)
					const requiredEnergy = hermitCard.getAttackCost('secondary')

					if (
						!hasEnoughEnergy(
							currentEnergy,
							requiredEnergy,
							game.settings.noItemRequirements,
						)
					) {
						activeHermitNeedsItems = true
						console.log('New Boss AI - Active hermit needs items')

						// Find an empty item slot for the active hermit
						const activeHermitItemSlots = game.components.filter(
							BoardSlotComponent,
							query.slot.player(player.entity),
							query.slot.item,
							query.slot.empty,
							(game, slot) =>
								slot.inRow() && slot.rowEntity === activeRow.entity,
						)

						if (activeHermitItemSlots.length > 0) {
							console.log(
								'New Boss AI - Found empty item slot for active hermit',
							)
							targetItemSlot = activeHermitItemSlots[0].entity
						} else {
							console.log(
								'New Boss AI - Active hermit needs items but has no empty slots',
							)
						}
					} else {
						console.log(
							'New Boss AI - Active hermit already has enough items for secondary attack',
						)
					}
				} else {
					// Active hermit card not found or not a hermit, treat as not needing items specifically
					console.log(
						'New Boss AI - Active hermit card not found or invalid type',
					)
				}
			} else {
				console.log(
					'New Boss AI - No active hermit found or active hermit not in a row',
				)
			}

			// If active hermit doesn't need items or has no slots, find another hermit
			if (!targetItemSlot) {
				console.log(
					"New Boss AI - Looking for another hermit (non-active or active didn't need items/had no slots)",
				)

				// Find all non-active hermits on the board
				const nonActiveHermitSlots = game.components.filter(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.hermit,
					query.not(query.slot.empty),
					query.not(query.slot.active), // Exclude the active hermit explicitly
				)

				let bestHermitSlot: BoardSlotComponent | null = null
				let bestHealth = -1

				for (const hermitSlot of nonActiveHermitSlots) {
					if (!hermitSlot.inRow() || hermitSlot.row.health === null) {
						continue
					}

					const health = hermitSlot.row.health || 0
					const row = hermitSlot.row
					const hermitCard = row.getHermit()

					// Check if this hermit needs items
					let needsItems = false
					if (hermitCard && hermitCard.isHermit()) {
						const currentItems = game.components.filter(
							CardComponent,
							query.card.slot(query.slot.item),
							query.card.rowEntity(row.entity),
						)
						const currentEnergy = currentItems.flatMap(
							(item) => (item.props as any).energy || [],
						)
						const requiredEnergy = hermitCard.getAttackCost('secondary')
						if (
							!hasEnoughEnergy(
								currentEnergy,
								requiredEnergy,
								game.settings.noItemRequirements,
							)
						) {
							needsItems = true
						}
					}

					if (needsItems) {
						// Check if this hermit's row has empty item slots
						const itemSlots = game.components.filter(
							BoardSlotComponent,
							query.slot.player(player.entity),
							query.slot.item,
							query.slot.empty,
							(_game, slot) => slot.inRow() && slot.rowEntity === row.entity,
						)

						if (itemSlots.length > 0 && health > bestHealth) {
							bestHealth = health
							bestHermitSlot = hermitSlot
							targetItemSlot = itemSlots[0].entity
						}
					}
				}

				if (targetItemSlot) {
					console.log(
						`New Boss AI - Found non-active hermit (${bestHermitSlot?.row?.getHermit()?.props.name ?? 'Unknown'}) with ${bestHealth} health needing items and having empty slots`,
					)
				} else {
					console.log('New Boss AI - No suitable non-active hermits found')

					// Fallback: Find any empty item slot, preferring one not on the active hermit's row (if applicable)
					const allEmptyItemSlots = game.components.filter(
						BoardSlotComponent,
						query.slot.player(player.entity),
						query.slot.item,
						query.slot.empty,
					)

					if (allEmptyItemSlots.length > 0) {
						// Try to find a slot not belonging to the original active hermit's row (if it existed and didn't need items)
						let fallbackSlot = allEmptyItemSlots.find(
							(slot) =>
								!activeHermitRowEntity ||
								!slot.inRow() ||
								slot.rowEntity !== activeHermitRowEntity,
						)

						if (fallbackSlot) {
							targetItemSlot = fallbackSlot.entity
							console.log(
								"New Boss AI - Fallback: Found empty item slot not on active hermit's row",
							)
						} else {
							// If all empty slots are on the active hermit's row, just take the first one
							targetItemSlot = allEmptyItemSlots[0].entity
							console.log(
								"New Boss AI - Fallback: Found empty item slot (only available on active hermit's row)",
							)
						}
					} else {
						console.log(
							'New Boss AI - Fallback: No empty item slots found anywhere',
						)
					}
				}
			}

			if (targetItemSlot) {
				// Find the component instance using its entity ID string by providing a query function
				const targetSlotComponent = game.components.find(
					BoardSlotComponent,
					(_game, component) => component.entity === targetItemSlot,
				)

				if (!targetSlotComponent) {
					console.error(
						`New Boss AI - ERROR: Could not find BoardSlotComponent for target slot ID: ${targetItemSlot}`,
					)
					// Optionally, handle this error, e.g., by ending the turn or trying another action
					return game.state.turn.availableActions.includes('END_TURN')
						? [{type: 'END_TURN'}]
						: []
				}

				console.log('New Boss AI - Playing item card on selected item slot')
				return [
					{
						type: 'PLAY_ITEM_CARD',
						slot: targetSlotComponent.entity,
						card: {
							id: itemCard.props.numericId,
							entity: itemCard.entity,
							slot: itemCard.slotEntity,
							turnedOver: false,
							attackHint: null,
							prizeCard: false,
						},
					},
				]
			} else {
				console.log('New Boss AI - No empty item slot found for item card')
			}
		}
	}

	// Attack only after we've played all possible cards - lowest priority
	const attackType = game.state.turn.availableActions.find(
		(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
	)

	// Add detailed logging for attack availability
	console.log('New Boss AI - Attack availability check:')
	console.log('Available actions:', game.state.turn.availableActions)
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
		let selectedAttackType = attackType
		if (game.state.turn.availableActions.includes('SECONDARY_ATTACK')) {
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

		return [
			{
				type: selectedAttackType,
			},
		]
	} else {
		console.log(
			'New Boss AI - No attack action available. Available actions:',
			game.state.turn.availableActions,
		)
	}

	// Handle any custom action types we haven't explicitly addressed
	if (game.state.turn.availableActions.length > 0) {
		console.log(
			'New Boss AI - Handling fallback action:',
			game.state.turn.availableActions[0],
		)

		// Special handling for APPLY_EFFECT action which is used for single-use cards
		if (game.state.turn.availableActions[0] === 'APPLY_EFFECT') {
			// Check if we already applied this effect (to prevent double counting)
			const singleUseCard = game.components.find(
				CardComponent,
				query.card.slot(query.slot.singleUse),
			)

			// Only apply effect if there's a single-use card and player hasn't marked it as used yet
			if (singleUseCard && !player.singleUseCardUsed) {
				console.log(
					'New Boss AI - Applying effect from single-use card:',
					singleUseCard.props.id,
				)
				return [{type: 'APPLY_EFFECT'}]
			} else {
				console.log(
					'New Boss AI - Not applying effect - already used or no card found',
				)

				// Skip this action to avoid double-applying the effect
				if (game.state.turn.availableActions.length > 1) {
					// Try the next available action instead
					const nextAction = game.state.turn.availableActions[1]
					console.log(
						'New Boss AI - Skipping APPLY_EFFECT, trying next action:',
						nextAction,
					)
					return [{type: nextAction as any}]
				}
			}
		}

		// Fallback to the first available action if we can't handle it specifically
		return [{type: game.state.turn.availableActions[0] as any}]
	}

	// Check if we've been stuck for more than 5 seconds
	const currentTime = Date.now()
	if (currentTime - lastActionCheckTime > 5000) {
		console.log(
			'New Boss AI - TIMEOUT: Been stuck for more than 5 seconds, checking available actions again',
		)
		lastActionCheckTime = currentTime

		// Check if we have no active hermit but have AFK hermits
		const activeHermit = game.components.find(
			CardComponent,
			query.card.currentPlayer,
			query.card.active,
			query.card.slot(query.slot.hermit),
		)

		const afkHermits = game.components.filter(
			BoardSlotComponent,
			query.slot.player(player.entity),
			query.slot.hermit,
			query.not(query.slot.empty),
			query.not(query.slot.active),
		)

		// If we have no active hermit but have AFK hermits, prioritize switching to one
		if (
			!activeHermit &&
			afkHermits.length > 0 &&
			game.state.turn.availableActions.includes('CHANGE_ACTIVE_HERMIT')
		) {
			console.log(
				'New Boss AI - TIMEOUT: No active hermit found, switching to AFK hermit',
			)
			return [
				{
					type: 'CHANGE_ACTIVE_HERMIT',
					entity: afkHermits[0].entity,
				},
			]
		}

		// If we have any available actions, randomly select one
		if (game.state.turn.availableActions.length > 0) {
			// Filter out APPLY_EFFECT if the single-use card has already been used
			let availableActions = game.state.turn.availableActions
			if (
				availableActions.includes('APPLY_EFFECT') &&
				player.singleUseCardUsed
			) {
				console.log(
					'New Boss AI - TIMEOUT: Filtering out APPLY_EFFECT because single-use card already used',
				)
				availableActions = availableActions.filter(
					(action) => action !== 'APPLY_EFFECT',
				)

				// If no actions left after filtering, return empty array
				if (availableActions.length === 0) {
					console.log(
						'New Boss AI - TIMEOUT: No actions available after filtering',
					)
					return []
				}
			}

			const randomIndex = Math.floor(game.rng() * availableActions.length)
			const randomAction = availableActions[randomIndex]
			console.log(
				'New Boss AI - TIMEOUT: Randomly selecting action:',
				randomAction,
			)

			// Handle special cases for different action types
			if (randomAction === 'CHANGE_ACTIVE_HERMIT') {
				// Find a random hermit to switch to
				const hermitSlots = game.components.filter(
					BoardSlotComponent,
					query.slot.player(player.entity),
					query.slot.hermit,
					query.not(query.slot.empty),
					query.not(query.slot.active),
				)

				if (hermitSlots.length > 0) {
					const randomSlotIndex = Math.floor(game.rng() * hermitSlots.length)
					const randomSlot = hermitSlots[randomSlotIndex]
					console.log(
						'New Boss AI - TIMEOUT: Randomly switching to hermit at slot:',
						randomSlot.entity,
					)
					return [
						{
							type: 'CHANGE_ACTIVE_HERMIT',
							entity: randomSlot.entity,
						},
					]
				}
			} else if (
				randomAction === 'PRIMARY_ATTACK' ||
				randomAction === 'SECONDARY_ATTACK'
			) {
				// For attacks, we need to make sure we have an active hermit
				const bossCard = game.components.find(
					CardComponent,
					query.card.currentPlayer,
					query.card.active,
					query.card.slot(query.slot.hermit),
				)

				// If we don't have an active hermit but have AFK hermits, switch to one first
				if (
					!bossCard &&
					afkHermits.length > 0 &&
					game.state.turn.availableActions.includes('CHANGE_ACTIVE_HERMIT')
				) {
					console.log(
						'New Boss AI - TIMEOUT: No active hermit for attack, switching to AFK hermit first',
					)
					return [
						{
							type: 'CHANGE_ACTIVE_HERMIT',
							entity: afkHermits[0].entity,
						},
					]
				}
			} else if (randomAction === 'APPLY_EFFECT') {
				// For APPLY_EFFECT, check if there's a single-use card and it hasn't been used yet
				const singleUseCard = game.components.find(
					CardComponent,
					query.card.slot(query.slot.singleUse),
				)

				if (singleUseCard && !player.singleUseCardUsed) {
					console.log(
						'New Boss AI - TIMEOUT: Applying effect from single-use card:',
						singleUseCard.props.id,
					)
					return [{type: 'APPLY_EFFECT'}]
				} else {
					console.log(
						'New Boss AI - TIMEOUT: Skipping APPLY_EFFECT - already used or no card found',
					)
					// Skip this action
					return []
				}
			}

			// For other actions, just return the action type
			return [{type: randomAction as any}]
		}
	} else if (lastActionCheckTime === 0) {
		// Initialize the last check time if it's the first time
		lastActionCheckTime = currentTime
	}

	// Only try to end turn if END_TURN is available
	if (game.state.turn.availableActions.includes('END_TURN')) {
		console.log('New Boss AI - Ending turn')
		return [{type: 'END_TURN'}]
	} else {
		// If END_TURN is not available, return an empty array to let the game continue
		console.log('New Boss AI - END_TURN not available, returning empty array')
		return []
	}
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
