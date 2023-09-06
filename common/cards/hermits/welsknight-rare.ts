import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import HermitCard from '../base/hermit-card'

class WelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'welsknight_rare',
			numericId: 107,
			name: 'Wels',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 280,
			primary: {
				name: "Knight's Blade",
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Vengeance',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power: 'Add 20hp damage if your HP is orange. Add 40hp damage if your HP is red.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			if (!attack.attacker) return

			if (attack.attacker.row.health < 200) attack.addDamage(this.id, 20)
			if (attack.attacker.row.health < 100) attack.addDamage(this.id, 20)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default WelsknightRareHermitCard
