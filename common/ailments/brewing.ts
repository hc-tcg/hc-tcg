import Ailment from './ailment'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {AilmentT} from '../types/game-state'
import {discardCard} from '../utils/movement'
import {HERMIT_CARDS} from '../cards'

class BrewingAilment extends Ailment {
	constructor() {
		super({
			id: 'brewing',
			name: 'Brewing',
			description: 'Converts 1 item card to 50hp every 2 turns',
			duration: 1,
			counter: true,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player} = pos

		player.hooks.onTurnEnd.add(ailmentInfo.ailmentInstance, () => {
			if (ailmentInfo.duration === 0) {
				ailmentInfo.duration = 1
				if (!pos.row?.itemCards) return
				const itemCards = pos.row.itemCards.filter((value) => value !== null)
				if (itemCards.length === 0) return
				var randomPos = Math.floor(Math.random() * (itemCards.length - 1))
				discardCard(game, itemCards[randomPos])
				const card = pos.row.hermitCard
				if (!card || !pos.row.health) return
				const hermitInfo = HERMIT_CARDS[card.cardId]
				if (hermitInfo) {
					pos.row.health = Math.min(pos.row.health + 50, hermitInfo.health)
				} else {
					// Armor Stand
					pos.row.health += 50
				}
			} else {
				ailmentInfo.duration = 0
			}
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.availableEnergy.remove(ailmentInfo.ailmentInstance)
		opponentPlayer.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default BrewingAilment
