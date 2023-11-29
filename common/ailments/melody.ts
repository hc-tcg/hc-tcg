import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {removeAilment} from '../utils/board'
import {AilmentT} from '../types/game-state'
import {HERMIT_CARDS} from '../cards'

class MelodyAilment extends Ailment {
	constructor() {
		super({
			id: 'melody',
			name: "Ollie's Melody",
			description: 'This Hermit heals 10hp every turn.',
			duration: 0,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		const hasMelody = game.state.ailments.some(
			(a) => a.targetInstance === pos.card?.cardInstance && a.ailmentId === 'melody'
		)

		if (hasMelody) return

		game.state.ailments.push(ailmentInfo)

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			const targetPos = getBasicCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos || !targetPos.row || !targetPos.rowIndex || !targetPos.row.hermitCard) return

			const hermitInfo = HERMIT_CARDS[targetPos.row.hermitCard.cardId]
			if (hermitInfo) {
				targetPos.row.health = Math.min(targetPos.row.health + 10, hermitInfo.health)
			}
		})

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default MelodyAilment
