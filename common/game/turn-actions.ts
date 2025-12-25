import {CARDS} from '../cards'
import {CardComponent} from '../components'
import {unknownCard} from '../components/card-component'
import query from '../components/query'
import {SlotEntity} from '../entities'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {HermitAttackType} from '../types/attack'
import {
	CopyAttack,
	DragCards,
	ModalResult,
	SelectCards,
	SpyglassModal,
} from '../types/modal-requests'
import {
	LocalCopyAttack,
	LocalDragCards,
	LocalSelectCards,
	LocalSpyglassModal,
} from '../types/server-requests'
import {
	AttackActionData,
	ChangeActiveHermitActionData,
	PlayCardActionData,
	attackActionToAttack,
	attackToAttackAction,
} from '../types/turn-action-data'
import {assert} from '../utils/assert'
import {executeAttacks} from '../utils/attacks'
import {applySingleUse} from '../utils/board'

async function getAttack(
	game: GameModel,
	creator: CardComponent,
	hermitAttackType: HermitAttackType,
): Promise<Array<AttackModel>> {
	const {currentPlayer} = game
	const attacks: Array<AttackModel> = []

	// hermit attacks
	if (!creator.isHermit()) return []

	const nextAttack = creator.props.getAttack(game, creator, hermitAttackType)
	creator.player.updateLastUsedHermitAttack(hermitAttackType)

	if (nextAttack) attacks.push(nextAttack)

	// all other attacks
	const otherAttacks = currentPlayer.hooks.getAttack.call()
	await game.waitForCoinFlips()
	await Promise.all(
		otherAttacks.map(async (otherAttack) => {
			if (otherAttack) {
				attacks.push(await Promise.resolve(otherAttack))
			}
		}),
	)

	if (game.settings.oneShotMode) {
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].addDamage('debug', 1001)
		}
	}

	return attacks
}

export async function attackAction(
	game: GameModel,
	turnAction: AttackActionData,
	checkForRequests = true,
) {
	const hermitAttackType = attackActionToAttack[turnAction.type]
	const {currentPlayer, state} = game
	const activeInstance = game.currentPlayer.activeRow?.getHermit()

	assert(activeInstance, 'You can not attack without an active hermit.')

	if (checkForRequests) {
		// First allow cards to add attack requests
		currentPlayer.hooks.getAttackRequests.call(activeInstance, hermitAttackType)
		await game.waitForCoinFlips()

		if (game.hasActiveRequests()) {
			// We have some pick/modal requests that we want to execute before the attack
			// The code for picking new actions will automatically send the right action back to client
			state.turn.currentAttack = hermitAttackType
			return
		}
	}

	// Get initial attacks
	let attacks: Array<AttackModel> = await getAttack(
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
	await executeAttacks(game, attacks)
	await game.waitForCoinFlips()

	attacks.forEach((attack) => {
		game.battleLog.addAttackEntry(
			attack,
			game.currentPlayer.coinFlips,
			thisAttackSU,
		)
	})
	console.log('after attack entry added')

	game.battleLog.opponentCoinFlipEntry(currentPlayer.coinFlips)

	if (currentPlayer.coinFlips.length === 0) {
		game.battleLog.sendLogs()
	}
}

export async function playCardAction(
	game: GameModel,
	turnAction: PlayCardActionData,
) {
	// Make sure data sent from client is correct
	const slotEntity = turnAction?.slot
	const localCard = turnAction?.card
	assert(slotEntity && localCard)

	let card = game.components.get(turnAction.card.entity)

	assert(card, 'You can not play a card that is not in the ECS')

	if (card.props.id === unknownCard.id) {
		card.props = CARDS[localCard.id]
	}

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

	const row = pickedSlot.row
	const rowIndex = pickedSlot.index
	const player = pickedSlot.player

	// Do we meet requirements to place the card
	const canAttach = card.props.attachCondition(game, pickedSlot)

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
				console.log('attaching hermit')
				currentPlayer.hasPlacedHermit = true
				assert(
					card.isHealth(),
					'Can not place a card that does not implement health to hermit slot: ' +
						card.props.numericId,
				)

				console.log('running attach')
				card.attach(pickedSlot)
				pickedSlot.row.health = card.props.health

				if (player?.activeRowEntity === null) {
					currentPlayer.changeActiveRow(pickedSlot.row)
				}

				console.log('done')
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
	await game.waitForCoinFlips()

	console.log('end of the function')
}

export async function applyEffectAction(game: GameModel) {
	applySingleUse(game, null)
}

export async function removeEffectAction(game: GameModel) {
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

export async function changeActiveHermitAction(
	game: GameModel,
	turnAction: ChangeActiveHermitActionData,
) {
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

export async function modalRequestAction(
	game: GameModel,
	localModalResult:
		| LocalSelectCards.Result
		| LocalCopyAttack.Result
		| LocalDragCards.Result
		| LocalSpyglassModal.Result,
) {
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
	} else if (modalRequest.modal.type === 'spyglass') {
		let modalRequest_ = modalRequest as SpyglassModal.Request
		modalResult = localModalResult as SpyglassModal.Result
		let modal = localModalResult as SpyglassModal.Result
		modalRequest_.onResult(modal)
	} else throw Error('Unknown modal type')

	game.hooks.onModalRequestResolve.call(modalRequest, modalResult)
	await game.waitForCoinFlips()

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

export async function pickRequestAction(
	game: GameModel,
	pickResult?: SlotEntity,
) {
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

	await game.waitForCoinFlips()
	game.hooks.onPickRequestResolve.call(pickRequest, slotInfo)

	// We completed this pick request, remove it
	game.state.pickRequests.shift()

	if (!game.hasActiveRequests() && game.state.turn.currentAttack) {
		// There are no active requests left, and we're in the middle of an attack. Execute it now.
		const turnAction: AttackActionData = {
			type: attackToAttackAction[game.state.turn.currentAttack],
		}
		await attackAction(game, turnAction, false)
		game.state.turn.currentAttack = null
		return
	}

	return
}
