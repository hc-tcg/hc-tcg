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
				cost: ['miner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Starched',
				cost: ['miner', 'miner'],
				damage: 80,
				power: 'Attack damage doubles versus Farm types.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			const target = attack.getTarget()
			if (attack.id !== attackId || attack.type !== 'secondary' || !target) return

			const isFarmer =
				target.row.hermitCard && HERMIT_CARDS[target.row.hermitCard.cardId]?.hermitType === 'farm'
					? 2
					: 1

			attack.multiplyDamage(this.id, isFarmer)
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
