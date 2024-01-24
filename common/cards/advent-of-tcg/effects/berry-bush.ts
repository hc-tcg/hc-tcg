import EffectCard from '../../base/effect-card'
import {isTargetingPos} from '../../../utils/attacks'
import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {CardPosModel, getBasicCardPos} from '../../../models/card-pos-model'
import {TurnActions} from '../../../types/game-state'
import {getActiveRow} from '../../../utils/board'

class BerryBushEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'berry_bush',
			numericId: 200,
			name: 'Sweet Berry Bush',
			rarity: 'ultra_rare',
			description:
				"Use like a Hermit card. Place on one of your opponent's empty Hermit slots. Has 30hp.\n\nCan not attach cards to it.\nYou do not get a point when it's knocked out.\n\nLoses 10hp per turn. If you knock out Sweet Berry Bush before it's HP becomes 0, add 2 Instant Healing II into your hand.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const newPos = getBasicCardPos(game, instance)
		if (!newPos) return
		const {player, opponentPlayer, row, rowIndex} = newPos
		if (!row) return

		row.health = 30

		player.hooks.afterAttack.add(instance, () => {
			if (!row.health) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
			}
		})

		opponentPlayer.hooks.afterAttack.add(instance, () => {
			if (!row.health) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
				for (let i = 0; i < 2; i++) {
					const cardInfo = {
						cardId: 'instant_health_ii',
						cardInstance: Math.random().toString(),
					}
					opponentPlayer.hand.push(cardInfo)
				}
			}
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			if (!row.health || row.health <= 10) {
				discardCard(game, row.hermitCard)
				return
			}
			row.health -= 10
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos

		if (getActiveRow(player) === row) {
			game.changeActiveRow(player, null)
		}

		if (slot && slot.type === 'hermit' && row) {
			row.health = null
			row.effectCard = null
			row.itemCards = []
		}

		player.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {slot} = pos
		const {currentPlayer, opponentPlayer} = game

		if (!slot || slot.type !== 'hermit') return 'INVALID'
		if (pos.player.id !== opponentPlayer.id) return 'INVALID'
		if (opponentPlayer.board.activeRow === null) return 'INVALID'
		if (currentPlayer.board.activeRow === null) return 'INVALID'

		return 'YES'
	}

	override canAttachToCard(game: GameModel, pos: CardPosModel) {
		return false
	}

	public override getActions(game: GameModel): TurnActions {
		const {opponentPlayer} = game

		// Is there a hermit slot free on the board
		const spaceForHermit = opponentPlayer.board.rows.some((row) => !row.hermitCard)

		return spaceForHermit ? ['PLAY_HERMIT_CARD'] : []
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override showAttachTooltip() {
		return false
	}
}

export default BerryBushEffectCard
