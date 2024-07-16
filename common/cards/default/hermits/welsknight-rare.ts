import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class WelsknightRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'welsknight_rare',
		numericId: 107,
		name: 'Wels',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
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
			power:
				"If this Hermit's HP is orange (190-100), do an additional 20hp damage.\nIf this Hermit's HP is red (90 or lower), do an additional 40hp damage.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary') return
			const attacker = attack.getAttacker()
			if (!attacker) return

			if (attacker.row.health < 200) attack.addDamage(this.props.id, 20)
			if (attacker.row.health < 100) attack.addDamage(this.props.id, 20)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default WelsknightRareHermitCard
