import {CardComponent} from '../../../components'
import {card} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import Bow from '../../default/single-use/bow'

class HotguyRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'hotguy_rare',
		numericId: 131,
		name: 'Hotguy',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
		health: 280,
		primary: {
			name: 'Velocité',
			cost: ['explorer'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Hawkeye',
			cost: ['explorer', 'explorer'],
			damage: 80,
			power: 'When used with a bow effect card, bow damage doubles.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		let usingSecondaryAttack = false

		player.hooks.beforeAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity) return
			usingSecondaryAttack = attack.type === 'secondary'
		})

		player.hooks.beforeAttack.add(component, (attack) => {
			if (!usingSecondaryAttack) return
			let bow = game.components.find(CardComponent, card.is(Bow))
			if (bow) {
				attack.addDamage(bow.entity, attack.getDamage())
			}
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.remove(component)
		player.hooks.onTurnEnd.remove(component)
	}
}

export default HotguyRare
