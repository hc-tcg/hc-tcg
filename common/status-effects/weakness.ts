import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CARDS, HERMIT_CARDS} from '../cards'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {AttackModel} from '../models/attack-model'
import {StatusEffectT} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'
import {STRENGTHS} from '../const/strengths'
import {WEAKNESS_DAMAGE} from '../const/damage'

class WeaknessStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'weakness',
			name: 'Weakness',
			description: "[reciever] is currently weak to [sender].",
			duration: 3,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const { player, opponentPlayer } = pos
		const strongType = "0"
		const weakType = "0"
		this.description = weakType + " is currently weak to " + strongType

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		player.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})

		opponentPlayer.hooks.onAttack.add(statusEffectInfo.statusEffectInstance, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)

			if (!targetPos) return

			if (!isTargetingPos(attack, targetPos) || attack.createWeakness === 'never') {
				return
			}

			attack.createWeakness = 'always'
		})

		player.hooks.onAttack.add(statusEffectInfo.statusEffectInstance, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)

			if (!targetPos) return

			if (!isTargetingPos(attack, targetPos) || attack.createWeakness === 'never') {
				return
			}

			const attacker = attack.getAttacker()
			const opponentActiveHermit = getActiveRow(opponentPlayer)

			if (!attacker || !opponentActiveHermit) return

			const attackerType = CARDS[attacker.row.hermitCard.cardId].type
			const opponentType = CARDS[opponentActiveHermit.hermitCard.cardId].type

			if (attackerType !== opponentType) return

			attack.createWeakness = 'always'
		})

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != statusEffectInfo.targetInstance) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onAttack.remove(statusEffectInfo.statusEffectInstance)
		opponentPlayer.hooks.onAttack.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default WeaknessStatusEffect
