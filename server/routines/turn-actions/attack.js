import CARDS from '../../cards'
import STRENGTHS from '../../const/strengths'
import {applySingleUse, getPickedCardsInfo, discardCard} from '../../utils'

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

export const WEAKNESS_DAMAGE = 20

function* attackSaga(game, turnAction, derivedState) {
	const {currentPlayer, opponentPlayer} = derivedState
	const {type, pickedCards} = turnAction.payload
	const typeAction = ATTACK_TO_ACTION[type]
	if (!typeAction) {
		console.log('Unknown attack type: ', type)
		return 'INVALID'
	}
	// TODO - send hermitCard from frontend for validation?

	const attackerActiveRow =
		currentPlayer.board.rows[currentPlayer.board.activeRow]
	const opponentActiveRow =
		opponentPlayer.board.rows[opponentPlayer.board.activeRow]

	const pickedCardsInfo = getPickedCardsInfo(game.state, pickedCards)
	const afkTargetRow =
		pickedCardsInfo.length === 1 &&
		pickedCardsInfo[0].playerId == opponentPlayer.id &&
		pickedCardsInfo[0].rowIndex !== opponentPlayer.board.activeRow
			? pickedCardsInfo[0].row
			: null

	if (!attackerActiveRow) return 'INVALID'

	const attackerHermitCard = attackerActiveRow.hermitCard
	const attackerHermitInfo = CARDS[attackerHermitCard.cardId]
	if (!attackerHermitInfo) return 'INVALID'
	const strengths = STRENGTHS[attackerHermitInfo.hermitType]

	const singleUseCard = !currentPlayer.board.singleUseCardUsed
		? currentPlayer.board.singleUseCard
		: null
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null

	const makeTarget = (row) => ({
		row,
		effectCardId: row.effectCard?.cardId,
		isActive: row === opponentActiveRow,
		damage: 0,
		protection: 0,
		recover: 0,
		ignoreProtection: false,
		backlash: 0,
		multiplier: 1,
	})
	const targets = []
	if (opponentActiveRow?.hermitCard) {
		targets.push(makeTarget(opponentActiveRow))
	}
	if (afkTargetRow?.hermitCard) {
		targets.push(makeTarget(afkTargetRow))
	}

	if (!targets.length) return 'INVALID'

	for (let target of targets) {
		const result = game.hooks.attack.call(target, turnAction, {
			...derivedState,
			typeAction,
			singleUseInfo,
			opponentActiveRow,
			attackerActiveRow,
			attackerHermitCard,
			attackerHermitInfo,
		})

		const targetHermitInfo = CARDS[target.row.hermitCard.cardId]
		const hermitAttack = target.isActive
			? attackerHermitInfo[type]?.damage || 0
			: 0
		const health = target.row.health
		const maxHealth = targetHermitInfo.health
		const protection = target.ignoreProtection ? 0 : target.protection
		const weaknessDamage = strengths.includes(targetHermitInfo.hermitType)
			? WEAKNESS_DAMAGE
			: 0
		const totalDamage =
			Math.max(hermitAttack + target.damage + weaknessDamage - protection, 0) *
			target.multiplier
		target.row.health = Math.min(maxHealth, health - totalDamage)

		// hacky way to make golden_axe bypass totem
		if (target.row.health < 0 && !target.ignoreProtection && target.recover) {
			target.row.health = target.recover
			target.row.ailments = []
			discardCard(game, target.row.effectCard)
		}

		// console.log('ATTACK: ', {
		// 	target,
		// 	hermitAttack,
		// 	health,
		// 	maxHealth,
		// 	protection,
		// 	weaknessDamage,
		// 	totalDamage,
		// })

		attackerActiveRow.health -= target.backlash
	}

	const anyDamage = targets.some((target) => target.damage)
	if (anyDamage) applySingleUse(currentPlayer)

	return 'DONE'
}

export default attackSaga
