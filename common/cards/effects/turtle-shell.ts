import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import {discardCard} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class TurtleShellEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'turtle_shell',
			name: 'Turtle Shell',
			rarity: 'rare',
			description:
				"Attach to any of your AFK Hermits. When that Hermit becomes active, this card prevents any damage done by your opponent for that Hermit's first turn, and is then discarded.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {currentPlayer} = game

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		if (!pos.row?.hermitCard) return 'NO'

		// turtle shell addition - hermit must be inactive to attach
		if (!(currentPlayer.board.activeRow !== pos.rowIndex)) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onBecomeActive.add(instance, (row) => {
			if (row !== pos.rowIndex) return
			player.custom[instanceKey] = true
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
				attack.multiplyDamage(this.id, 0).lockDamage()
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !player.custom[instanceKey]) return
			discardCard(game, {cardId: this.id, cardInstance: instance})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)
		
		pos.player.hooks.onDefence.remove(instance)
		pos.player.hooks.onBecomeActive.remove(instance)
		pos.opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[instanceKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default TurtleShellEffectCard
