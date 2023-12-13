import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {removeAilment} from '../utils/board'
import {AilmentT} from '../types/game-state'

class MuseumCollectionAilment extends Ailment {
	constructor() {
		super({
			id: 'museum-collection',
			name: 'Museum Collection Size',
			description:
				"Number of cards you've played this turn. Each card adds 20 damage to Biffa's secondary attack.",
			duration: 0,
			counter: true,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const oldHandSize = this.getInstanceKey(ailmentInfo.ailmentInstance)
		const {player} = pos

		player.custom[oldHandSize] = player.hand.length

		player.hooks.onAttach.add(ailmentInfo.ailmentInstance, (instance) => {
			if (player.hand.length === player.custom[oldHandSize]) return
			const instanceLocation = getBasicCardPos(game, instance)
			if (ailmentInfo.duration === undefined) return
			player.custom[oldHandSize] = player.hand.length
			if (instanceLocation?.slot.type === 'single_use') return
			ailmentInfo.duration++
		})

		player.hooks.onApply.add(ailmentInfo.ailmentInstance, () => {
			if (ailmentInfo.duration === undefined) return
			player.custom[oldHandSize] = player.hand.length
			ailmentInfo.duration++
		})

		player.hooks.onAttack.add(ailmentInfo.ailmentInstance, (attack) => {
			const activeRow = player.board.activeRow
			if (activeRow === null) return
			const targetHermit = player.board.rows[activeRow].hermitCard
			if (!targetHermit?.cardId) return
			if (
				attack.id !== this.getTargetInstanceKey(targetHermit?.cardId, ailmentInfo.targetInstance) ||
				attack.type !== 'secondary'
			)
				return
			if (ailmentInfo.duration === undefined) return

			player.hooks.onApply.remove(ailmentInfo.ailmentInstance)
			player.hooks.onApply.add(ailmentInfo.ailmentInstance, () => {
				if (ailmentInfo.duration === undefined) return
				ailmentInfo.duration++
				attack.addDamage(this.id, 20)
			})

			attack.addDamage(this.id, 20 * ailmentInfo.duration)
		})

		player.hooks.onTurnEnd.add(ailmentInfo.ailmentInstance, () => {
			delete player.custom[oldHandSize]
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onApply.remove(ailmentInfo.ailmentInstance)
		player.hooks.onAttach.remove(ailmentInfo.ailmentInstance)
		player.hooks.onAttack.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
	}
}

export default MuseumCollectionAilment
