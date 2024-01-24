import {CardPosModel} from '../models/card-pos-model'
import {GameModel} from '../models/game-model'
import {AilmentT} from '../types/game-state'
import {getActiveRow, removeAilment} from '../utils/board'
import {isRemovable} from '../utils/cards'
import {discardCard, discardFromHand} from '../utils/movement'
import Ailment from './ailment'

class ExBossNineAilment extends Ailment {
	constructor() {
		super({
			id: 'exboss-nine',
			name: 'My Rules',
			description: "At the end of EX's ninth turn, an additional move will be performed.",
			duration: 1,
			counter: true,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel): void {
		game.state.ailments.push(ailmentInfo)
		const {player, opponentPlayer} = pos

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (ailmentInfo.duration === undefined) ailmentInfo.duration = 1
			ailmentInfo.duration += 1
		})

		player.hooks.onTurnEnd.add(ailmentInfo.ailmentInstance, () => {
			if (ailmentInfo.duration !== 9) return

			if (Math.random() > 0.5) {
				// Discard the opponent's hand and have them draw one new card
				opponentPlayer.hand.forEach((card) => discardFromHand(opponentPlayer, card))
				const newCard = opponentPlayer.pile.shift()
				if (newCard) opponentPlayer.hand.push(newCard)
			} else {
				// Discard all cards attached to the opponent's active hermit
				const opponentActiveRow = getActiveRow(opponentPlayer)
				if (opponentActiveRow) {
					if (opponentActiveRow.effectCard && isRemovable(opponentActiveRow.effectCard))
						discardCard(game, opponentActiveRow.effectCard)

					opponentActiveRow.itemCards.forEach((itemCard) => itemCard && discardCard(game, itemCard))
				}
			}

			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnEnd.remove(ailmentInfo.ailmentInstance)
	}
}

export default ExBossNineAilment
