import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
class PotatoBoyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'potatoboy_rare',
			name: 'Potato Boy',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Peace & Love',
				cost: ['farm'],
				damage: 0,
				power: 'Heals Hermit directly above and below for 40hp.',
			},
			secondary: {
				name: 'Volcarbo',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return

			const activeRow = player.board.activeRow
			if (activeRow === null) return

			const rows = player.board.rows

			const targetRows = [rows[activeRow - 1], rows[activeRow + 1]].filter(Boolean)

			targetRows.forEach((row) => {
				if (!row.hermitCard) return
				const hermitInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (hermitInfo) {
					row.health = Math.min(row.health + 40, hermitInfo.health)
				}
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default PotatoBoyRareHermitCard
