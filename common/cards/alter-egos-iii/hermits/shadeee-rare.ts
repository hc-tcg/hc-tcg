import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import query from '../../../components/query'

class ShadeEERare extends Card {
	props: Hermit = {
		...hermit,
		id: 'shadee_rare',
		numericId: 170,
		name: 'Shade-E-E',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'redstone',
		health: 270,
		primary: {
			name: 'Corrupt Contr.',
			cost: ['redstone'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Scale Of Ethics',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: 'If you have fewer AFK Hermits than your opponent, deal an additional 40hp damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const playerAfkHermits = game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hermit),
				query.card.afk
			).length

			const opponentAfkHermits = game.components.filter(
				CardComponent,
				query.card.player(opponentPlayer.entity),
				query.card.slot(query.slot.hermit),
				query.card.afk
			).length

			if (playerAfkHermits < opponentAfkHermits) {
				attack.addDamage(component.entity, 40)
			}
		})
	}
}

export default ShadeEERare
