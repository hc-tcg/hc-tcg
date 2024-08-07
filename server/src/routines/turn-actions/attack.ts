import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {DEBUG_CONFIG} from 'common/config'
import {AttackModel} from 'common/models/attack-model'
import {GameModel} from 'common/models/game-model'
import {HermitAttackType} from 'common/types/attack'
import {GenericActionResult} from 'common/types/game-state'
import {
	AttackActionData,
	attackActionToAttack,
} from 'common/types/turn-action-data'
import {executeAttacks} from 'common/utils/attacks'

function getAttack(
	game: GameModel,
	creator: CardComponent,
	hermitAttackType: HermitAttackType,
): Array<AttackModel> {
	const {currentPlayer} = game
	const attacks: Array<AttackModel> = []

	// hermit attacks
	if (!creator.card.isHermit()) return []

	const nextAttack = creator.card.getAttack(game, creator, hermitAttackType)

	if (nextAttack) attacks.push(nextAttack)

	// all other attacks
	const otherAttacks = currentPlayer.hooks.getAttack.call()
	otherAttacks.forEach((otherAttack) => {
		if (otherAttack) attacks.push(otherAttack)
	})

	if (DEBUG_CONFIG.oneShotMode) {
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].addDamage('debug', 1001)
		}
	}

	return attacks
}

function* attackSaga(
	game: GameModel,
	turnAction: AttackActionData,
	checkForRequests = true,
): Generator<any, GenericActionResult> {
	if (!turnAction?.type) {
		return 'FAILURE_INVALID_DATA'
	}

	const hermitAttackType = attackActionToAttack[turnAction.type]
	const {currentPlayer, state} = game
	const activeInstance = game.components.find(
		CardComponent,
		query.card.currentPlayer,
		query.card.isHermit,
		query.card.active,
	)
	if (!activeInstance) return 'FAILURE_CANNOT_COMPLETE'

	if (checkForRequests) {
		// First allow cards to add attack requests
		currentPlayer.hooks.getAttackRequests.call(activeInstance, hermitAttackType)

		if (game.hasActiveRequests()) {
			// We have some pick/modal requests that we want to execute before the attack
			// The code for picking new actions will automatically send the right action back to client
			state.turn.currentAttack = hermitAttackType

			return 'SUCCESS'
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

	return 'SUCCESS'
}

export default attackSaga
