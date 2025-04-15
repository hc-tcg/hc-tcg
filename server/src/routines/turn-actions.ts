import assert from 'assert'
import {CardComponent, ObserverComponent} from 'common/components'
import query from 'common/components/query'
import {SlotEntity} from 'common/entities'
import {AttackModel} from 'common/models/attack-model'
import {GameModel} from 'common/models/game-model'
import {HermitAttackType} from 'common/types/attack'
import {
	CopyAttack,
	DragCards,
	ModalResult,
	SelectCards,
} from 'common/types/modal-requests'
import {
	LocalCopyAttack,
	LocalDragCards,
	LocalSelectCards,
} from 'common/types/server-requests'
import {
	AttackActionData,
	ChangeActiveHermitActionData,
	PlayCardActionData,
	attackActionToAttack,
	attackToAttackAction,
} from 'common/types/turn-action-data'
import {executeAttacks} from 'common/utils/attacks'
import {applySingleUse} from 'common/utils/board'

function getAttack(
	game: GameModel,
	creator: CardComponent,
	hermitAttackType: HermitAttackType,
): Array<AttackModel> {
	const {currentPlayer} = game
	const attacks: Array<AttackModel> = []

	// hermit attacks
	if (!creator.isHermit()) return []

	const nextAttack = creator.props.getAttack(game, creator, hermitAttackType)
	creator.player.updateLastUsedHermitAttack(hermitAttackType)

	if (nextAttack) attacks.push(nextAttack)

	// all other attacks
	const otherAttacks = currentPlayer.hooks.getAttack.call()
	otherAttacks.forEach((otherAttack) => {
		if (otherAttack) attacks.push(otherAttack)
	})

	if (game.settings.oneShotMode) {
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].addDamage('debug', 1001)
		}
	}

	return attacks
}

export function attackAction(
	game: GameModel,
	turnAction: AttackActionData,
	checkForRequests = true,
): void {
	const hermitAttackType = attackActionToAttack[turnAction.type]
	const {currentPlayer, state} = game
	const activeInstance = game.currentPlayer.activeRow?.getHermit()

	assert(activeInstance, 'You can not attack without an active hermit.')

	if (checkForRequests) {
		// First allow cards to add attack requests
		currentPlayer.hooks.getAttackRequests.call(activeInstance, hermitAttackType)

		if (game.hasActiveRequests()) {
			// We have some pick/modal requests that we want to execute before the attack
			// The code for picking new actions will automatically send the right action back to client
			state.turn.currentAttack = hermitAttackType
			return
		}
	}

	// Get initial attacks
	let attacks: Array<AttackModel> = getAttack(
		game,
		activeInstance,
		hermitAttackType,
	)

	const thisAttackSU = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	// We block the actions before attacks to allow attacks to unblock actions if they need to.
	game.addCompletedActions(
		'SINGLE_USE_ATTACK',
		'PRIMARY_ATTACK',
		'SECONDARY_ATTACK',
	)
	game.addBlockedActions(
		'game',
		'SINGLE_USE_ATTACK',
		'PRIMARY_ATTACK',
		'SECONDARY_ATTACK',
		'PLAY_HERMIT_CARD',
		'PLAY_ITEM_CARD',
		'PLAY_EFFECT_CARD',
		'PLAY_SINGLE_USE_CARD',
		'CHANGE_ACTIVE_HERMIT',
	)

	// Run all the code stuff
	executeAttacks(game, attacks)

	attacks.forEach((attack) => {
		game.battleLog.addAttackEntry(
			attack,
			game.currentPlayer.coinFlips,
			thisAttackSU,
		)
	})

	game.battleLog.opponentCoinFlipEntry(currentPlayer.coinFlips)

	if (currentPlayer.coinFlips.length === 0) {
		game.battleLog.sendLogs()
	}
}

export function playCardAction(
	game: GameModel,
	turnAction: PlayCardActionData,
): void {
	// Make sure data sent from client is correct
	const slotEntity = turnAction?.slot
	const localCard = turnAction?.card
	assert(slotEntity && localCard)

	const card = game.components.get(localCard.entity)
	assert(card, 'You can not play a card that is not in the ECS')

	const {currentPlayer} = game

	const pickedSlot = game.components.get(slotEntity)
	assert(
		pickedSlot && pickedSlot.onBoard(),
		'A slot that is not on the board can not be picked: ' + pickedSlot,
	)

	assert(
		!pickedSlot.card,
		'You can not play a card in a slot with a card in it',
	)

	assert(
		!query.slot.frozen(game, card.slot),
		'You cannot play cards that are in frozen slots',
	)

	// Add detailed logging for single use cards
	if (pickedSlot.type === 'single_use') {
		console.log('Attempting to play single use card:', card.props.name)
		
		// Enhanced validation for single-use cards
		assert(
			card.isSingleUse(),
			'Only single-use cards can be played in single-use slots'
		)
		
		assert(
			!currentPlayer.singleUseCardUsed,
			'You have already used a single-use card this turn'
		)
		
		assert(
			query.slot.playerHasActiveHermit(game, pickedSlot),
			'You must have an active hermit to play a single-use card'
		)
		
		assert(
			!game.state.turn.completedActions.includes('PLAY_SINGLE_USE_CARD'),
			'Single-use card action has already been completed this turn'
		)
		
		// Log validation checks
		console.log('Slot is single use:', query.slot.singleUse(game, pickedSlot))
		console.log('Slot is empty:', query.slot.empty(game, pickedSlot))
		console.log('Player has active hermit:', query.slot.playerHasActiveHermit(game, pickedSlot))
		console.log('PLAY_SINGLE_USE_CARD action available:', !game.state.turn.completedActions.includes('PLAY_SINGLE_USE_CARD'))
		console.log('Current player single use card used:', currentPlayer.singleUseCardUsed)
		
		// Attach the card and trigger any immediate effects
		card.attach(pickedSlot)
		
		// If the card doesn't require confirmation, apply it immediately
		if (!card.props.showConfirmationModal) {
			applyEffectAction(game)
		}
	} else {
		// For non-single-use slots, we need to access row and rowIndex
		const row = pickedSlot.row
		const rowIndex = pickedSlot.index
		const player = pickedSlot.player

		assert(
			row && rowIndex !== null,
			'Placing a card on the board requires there to be a row.',
		)

		switch (pickedSlot.type) {
			case 'hermit': {
				currentPlayer.hasPlacedHermit = true
				assert(
					card.isHealth(),
					'Can not place a card that does not implement health to hermit slot: ' +
						card.props.numericId,
				)

				card.attach(pickedSlot)
				pickedSlot.row.health = card.props.health

				if (player?.activeRowEntity === null) {
					currentPlayer.changeActiveRow(pickedSlot.row)
				}

				break
			}
			case 'item': {
				if (card.props.category === 'item')
					game.addCompletedActions('PLAY_ITEM_CARD')
				card.attach(pickedSlot)
				break
			}
			case 'attach': {
				assert(
					card.isAttach(),
					'Attempted to add card that implement attach to an attach slot: ' +
						card.props.numericId,
				)
				card.attach(pickedSlot)
				break
			}
			default:
				throw new Error(
					'Unknown slot type when trying to play a card: ' + pickedSlot.type,
				)
		}
	}

	// Add entry to battle log, unless it is played in a single use slot
	if (pickedSlot.type !== 'single_use') {
		game.battleLog.addPlayCardEntry(card, currentPlayer.coinFlips, pickedSlot)
	}

	// Call onAttach hook
	currentPlayer.hooks.onAttach.call(card)
}

export function applyEffectAction(game: GameModel): void {
	const {currentPlayer} = game
	const suCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	// Make sure a single use card is present
	assert(
		suCard,
		'Cannot apply single use effect when there is no single use card on the board'
	)

	// Make sure we haven't already used a single-use card this turn
	assert(
		!currentPlayer.singleUseCardUsed,
		'You have already used a single-use card this turn'
	)

	// Make sure we have an active hermit
	assert(
		currentPlayer.activeRowEntity !== null,
		'You must have an active hermit to use a single-use card'
	)

	try {
		// First we execute the onAttach of the card to trigger its effect
		if (suCard.props.onAttach) {
			// Create observer component that will track the effect
			const observer = game.components.new(ObserverComponent, suCard.entity)
			suCard.props.onAttach(game, suCard, observer)
		}

		// Then we apply the single use (mark it as used, etc)
		applySingleUse(game, null)

		// Log successful application
		console.log('Successfully applied single-use card effect:', suCard.props.name)
	} catch (error) {
		// If there's an error applying the effect, clean up
		console.error('Error applying single-use card effect:', error)
		removeEffectAction(game)
		throw error
	}
}

export function removeEffectAction(game: GameModel): void {
	const {currentPlayer} = game
	let singleUseCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	// Cancel any pending pick requests
	game.cancelPickRequests()

	// Remove current attack
	if (game.state.turn.currentAttack) {
		game.state.turn.currentAttack = null
	}

	if (singleUseCard) {
		// Log the removal
		console.log('Removing single-use card:', singleUseCard.props.name)

		// Draw the card (move it to appropriate pile)
		singleUseCard.discard()

		// Reset the single-use card used flag if we're cleaning up after an error
		if (!currentPlayer.singleUseCardUsed) {
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
		}
	}
}

export function changeActiveHermitAction(
	game: GameModel,
	turnAction: ChangeActiveHermitActionData,
): void {
	const {currentPlayer} = game

	// Find the row we are trying to change to
	const pickedSlot = game.components.get(turnAction?.entity)
	assert(pickedSlot?.inRow(), 'Active hermits must be on the board.')
	const row = pickedSlot.row

	const hadActiveHermit = currentPlayer.activeRowEntity !== null

	// Change row
	const result = currentPlayer.changeActiveRow(row)
	assert(result, 'Active row change actions should not be allowed to fail')

	if (hadActiveHermit) {
		// We switched from one hermit to another, mark this action as completed
		game.addCompletedActions('CHANGE_ACTIVE_HERMIT')

		// Attack phase complete, mark most actions as blocked now
		game.addBlockedActions(
			'game',
			'SINGLE_USE_ATTACK',
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
		)
	}
}

export function modalRequestAction(
	game: GameModel,
	localModalResult:
		| LocalSelectCards.Result
		| LocalCopyAttack.Result
		| LocalDragCards.Result,
): void {
	const modalRequest = game.state.modalRequests[0]

	assert(
		modalRequest,
		`Client sent modal result without request! Result: ${localModalResult}`,
	)

	let modalResult: ModalResult

	// Call the bound function with the pick result
	if (modalRequest.modal.type === 'selectCards') {
		let modalRequest_ = modalRequest as SelectCards.Request
		let modal = localModalResult as LocalSelectCards.Result
		modalResult = {
			...modal,
			cards: modal.cards
				? modal.cards.map((entity) => game.components.get(entity)!)
				: null,
		} as SelectCards.Result
		modalRequest_.onResult(modalResult)
	} else if (modalRequest.modal.type === 'dragCards') {
		let modalRequest_ = modalRequest as DragCards.Request
		let modal = localModalResult as LocalDragCards.Result
		modalResult = {
			...modal,
			leftCards: modal.leftCards
				? modal.leftCards.map((entity) => game.components.get(entity)!)
				: null,
			rightCards: modal.rightCards
				? modal.rightCards.map((entity) => game.components.get(entity)!)
				: null,
		} as DragCards.Result
		modalRequest_.onResult(modalResult as DragCards.Result)
	} else if (modalRequest.modal.type === 'copyAttack') {
		let modalRequest_ = modalRequest as CopyAttack.Request
		modalResult = localModalResult as CopyAttack.Result
		let modal = localModalResult as CopyAttack.Result
		assert(
			!modal.pick || modalRequest.modal.availableAttacks.includes(modal.pick),
			`Client picked an action that was not available to copy: ${modal.pick}`,
		)
		modalRequest_.onResult(modal)
	} else throw Error('Unknown modal type')

	game.hooks.onModalRequestResolve.call(modalRequest, modalResult)

	// We completed the modal request, remove it
	game.state.modalRequests.shift()

	if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
		// There are no active requests left, and we're in the middle of an attack. Execute it now.
		const turnAction: AttackActionData = {
			type: attackToAttackAction[game.state.turn.currentAttack],
		}
		attackAction(game, turnAction, false)

		game.state.turn.currentAttack = null
	}
}

export function pickRequestAction(
	game: GameModel,
	pickResult?: SlotEntity,
): void {
	// First validate data sent from client
	assert(pickResult, 'Pick results cannot have an emtpy body.')

	// Find the current pick request
	const pickRequest = game.state.pickRequests[0]
	assert(
		pickRequest,
		`Client sent pick result without request! Pick info: ${pickResult}`,
	)

	// Call the bound function with the pick result
	let slotInfo = game.components.get(pickResult)

	assert(slotInfo, 'The slot that is picked must be in the ECS')

	const canPick = pickRequest.canPick(game, slotInfo)

	assert(canPick, 'Invalid slots can not be picked.')

	const card = slotInfo.card

	// Because Worm Man, all cards need to be flipped over to normal once they're picked
	if (card) card.turnedOver = false

	pickRequest.onResult(slotInfo)
	let player = game.components.get(pickRequest.player)
	if (player) player.pickableSlots = null

	game.hooks.onPickRequestResolve.call(pickRequest, slotInfo)

	// We completed this pick request, remove it
	game.state.pickRequests.shift()

	if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
		// There are no active requests left, and we're in the middle of an attack. Execute it now.
		const turnAction: AttackActionData = {
			type: attackToAttackAction[game.state.turn.currentAttack],
		}
		attackAction(game, turnAction, false)

		game.state.turn.currentAttack = null

		return
	}

	return
}
