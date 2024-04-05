import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'

class OverseerRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'overseer_rare',
			numericId: 235,
			name: 'Overseer',
			rarity: 'rare',
			hermitType: 'miner',
			health: 250,
			primary: {
				name: 'Testing',
				cost: ['miner', 'miner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Starched',
				cost: ['miner'],
				damage: 80,
				power: 'Does double damage versus Farm types',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.target) return

			const isBuilder =
				attack.target.row.hermitCard &&
				HERMIT_CARDS[attack.target.row.hermitCard.cardId]?.hermitType === 'farm'
					? 2
					: 1

			attack.multiplyDamage(this.id, isBuilder)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.beforeAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos_ii'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default OverseerRareHermitCard
