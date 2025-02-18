import assert from 'assert'
import {CardComponent, SlotComponent} from 'common/components'
import query from 'common/components/query'
import {SlotEntity} from 'common/entities'
import {AttackModel} from 'common/models/attack-model'
import {GameModel} from 'common/models/game-model'
import {HermitAttackType} from 'common/types/attack'
import {CopyAttack, DragCards, SelectCards} from 'common/types/modal-requests'
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
	const activeInstance = game.components.find(
		CardComponent,
		query.card.currentPlayer,
		query.card.isHermit,
		query.card.active,
	)

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

	const card = game.components.find(
		CardComponent,
		query.card.entity(localCard.entity),
	)
	assert(card, 'You can not play a card that is not in the ECS')

	const {currentPlayer} = game

	const pickedSlot = game.components.get(slotEntity)
	assert(
		pickedSlot && pickedSlot.onBoard(),
		'A slot that is not on the board can not be picked: ' + pickedSlot,
	)

	assert(
		!pickedSlot.getCard(),
		'You can not play a card in a slot with a card in it',
	)

	const row = pickedSlot.row
	const rowIndex = pickedSlot.index
	const player = pickedSlot.player

	// Do we meet requirements to place the card
	const canAttach = card?.props.attachCondition(game, pickedSlot) || false

	// It's the wrong kind of slot or does not satisfy the condition
	assert(
		canAttach,
		'You can not play a card in a slot it cannot be attached to or at a time it can not be played.',
	)

	// Finally, execute depending on where we tried to place
	// And set the action result to be sent to the client

	// Single use slot
	if (pickedSlot.type === 'single_use') {
		card.attach(pickedSlot)
	} else {
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
	applySingleUse(game, null)
}

export function removeEffectAction(game: GameModel): void {
	let singleUseCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	game.cancelPickRequests()

	// Remove current attack
	if (game.state.turn.currentAttack) {
		game.state.turn.currentAttack = null
	}

	singleUseCard?.draw()
}

export function changeActiveHermitAction(
	game: GameModel,
	turnAction: ChangeActiveHermitActionData,
): void {
	const {currentPlayer} = game

	// Find the row we are trying to change to
	const pickedSlot = game.components.find(
		SlotComponent,
		query.slot.entity(turnAction?.entity),
	)
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
	modalResult:
		| LocalSelectCards.Result
		| LocalCopyAttack.Result
		| LocalDragCards.Result,
): void {
	const modalRequest = game.state.modalRequests[0]

	assert(
		modalRequest,
		`Client sent modal result without request! Result: ${modalResult}`,
	)

	// Call the bound function with the pick result
	if (modalRequest.modal.type === 'selectCards') {
		let modalRequest_ = modalRequest as SelectCards.Request
		let modal = modalResult as LocalSelectCards.Result
		modalRequest_.onResult({
			...modal,
			cards: modal.cards
				? modal.cards.map((entity) => game.components.get(entity)!)
				: null,
		} as SelectCards.Result)
	} else if (modalRequest.modal.type === 'dragCards') {
		let modalRequest_ = modalRequest as DragCards.Request
		let modal = modalResult as LocalDragCards.Result
		modalRequest_.onResult({
			...modal,
			leftCards: modal.leftCards
				? modal.leftCards.map((entity) => game.components.get(entity)!)
				: null,
			rightCards: modal.rightCards
				? modal.rightCards.map((entity) => game.components.get(entity)!)
				: null,
		} as DragCards.Result)
	} else if (modalRequest.modal.type === 'copyAttack') {
		let modalRequest_ = modalRequest as CopyAttack.Request
		let modal = modalResult as CopyAttack.Result
		assert(
			!modal.pick || modalRequest.modal.availableAttacks.includes(modal.pick),
			`Client picked an action that was not available to copy: ${modal.pick}`,
		)
		modalRequest_.onResult(modal)
	} else throw Error('Unknown modal type')

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
	let slotInfo = game.components.find(
		SlotComponent,
		query.slot.entity(pickResult),
	)

	assert(slotInfo, 'The slot that is picked must be in the ECS')

	const canPick = pickRequest.canPick(game, slotInfo)

	assert(canPick, 'Invalid slots can not be picked.')

	const card = slotInfo.getCard()

	// Because Worm Man, all cards need to be flipped over to normal once they're picked
	if (card) card.turnedOver = false

	pickRequest.onResult(slotInfo)
	let player = game.components.get(pickRequest.player)
	if (player) player.pickableSlots = null

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
