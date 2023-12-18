import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'

class DungeonTangoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'dungeontango_rare',
			numericId: 208,
			name: 'DM tango',
			rarity: 'rare',
			hermitType: 'miner',
			health: 280,
			primary: {
				name: 'Lackey',
				cost: ['any'],
				damage: 40,
				power: 'If you have one, draw a random hermit card from your deck.',
			},
			secondary: {
				name: 'Ravager',
				cost: ['miner', 'miner', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'primary') return

			let i: number = 0
			do {
				if (HERMIT_CARDS[player.pile[i].cardId]) {
					break
				}
				i++
			} while (i < player.pile.length)
			if (i == player.pile.length) return
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}
}

export default DungeonTangoRareHermitCard
