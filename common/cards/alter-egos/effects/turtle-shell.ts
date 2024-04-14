import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import {discardCard} from '../../../utils/movement'
import EffectCard from '../../base/effect-card'

class TurtleShellEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'turtle_shell',
			numericId: 125,
			name: 'Turtle Shell',
			rarity: 'rare',
			description:
				"Attach to any of your AFK Hermits. When that Hermit becomes active, this card prevents any damage done by your opponent for that Hermit's first turn, and is then discarded.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {currentPlayer} = game

		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		// turtle shell addition - hermit must be inactive to attach
		if (!(currentPlayer.board.activeRow !== pos.rowIndex)) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onTurnEnd.add(instance, () => {
			if (player.board.activeRow === pos.rowIndex) {
				player.custom[instanceKey] = true
			}
		})

		player.hooks.onTurnStart.add(instance, () => {
			if (player.custom[instanceKey]) {
				discardCard(game, pos.card)
			}
		})

		player.hooks.onDefence.add(instance, (attack) => {
			// Only block if just became active
			if (!player.custom[instanceKey]) return
			// Only block damage when we are active
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !isTargetingPos(attack, pos)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(this.id, 0).lockDamage(this.id)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onDefence.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		delete player.custom[instanceKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default TurtleShellEffectCard
