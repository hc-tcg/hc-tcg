import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heal any AFK Hermit for 100hp.',
			},
			pickOn: 'attack',
			pickReqs: [
				{
					target: 'board',
					slot: ['hermit'],
					type: ['hermit'],
					amount: 1,
					active: false,
				},
			],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const pickedHermit = pickedSlots[this.id]?.[0]
			if (!pickedHermit || !pickedHermit.row) return

			const rowState = pickedHermit.row.state
			if (!rowState.hermitCard) return

			const hermitInfo = HERMIT_CARDS[rowState.hermitCard.cardId]
			if (hermitInfo) {
				// Heal
				rowState.health = Math.min(
					rowState.health + 100,
					hermitInfo.health // Max health
				)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.player.hooks.onAttack.remove(instance)
	}
}

export default KeralisRareHermitCard
