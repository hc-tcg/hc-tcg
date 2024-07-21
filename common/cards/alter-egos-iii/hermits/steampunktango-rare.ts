import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'

class SteampunkTangoRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'steampunktango_rare',
		numericId: 174,
		name: 'Steampunk Tango',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'terraform',
		health: 270,
		primary: {
			name: 'Porkchop Power',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Assembly line',
			cost: ['terraform', 'terraform'],
			damage: 80,
			power: 'Deal an additional 10hp damage for each afk hermit you have.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const afkHermits = game.components.filter(
				CardComponent,
				query.card.slot(query.slot.hermit),
				query.not(query.card.active)
			).length

			attack.addDamage(component.entity, afkHermits * 10)
		})
	}
}

export default SteampunkTangoRare
