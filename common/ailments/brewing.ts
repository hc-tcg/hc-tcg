import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {AilmentT} from '../types/game-state'
import {discardCard} from '../utils/movement'
import {HERMIT_CARDS} from '../cards'
import { removeAilment } from '../utils/board'

class BrewingAilment extends Ailment {
	constructor() {
		super({
			id: 'brewing',
			name: 'Brewing',
			description: 'At the start of your next turn, pick an item card to discard and heal 50hp',
			duration: 0,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player} = pos

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
			if (!pos.row) return
			const itemCards = pos.row.itemCards.filter((value) => value !== null)
			if (itemCards.length === 0) return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Choose an item card to discard',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					if (!pos.row) return 'FAILURE_INVALID_SLOT'
					if (pickResult.rowIndex !== pos.rowIndex) return 'FAILURE_INVALID_SLOT'
					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					discardCard(game, pickResult.card)

					const hermitCard = pos.row.hermitCard
					if (!hermitCard || !pos.row.health) return 'SUCCESS'
					const hermitInfo = HERMIT_CARDS[hermitCard.cardId]
					if (hermitInfo) {
						pos.row.health = Math.min(pos.row.health + 50, hermitInfo.health)
					} else {
						// Armor Stand
						pos.row.health += 50
					}

					return 'SUCCESS'
				},
			})
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
	}
}

export default BrewingAilment
