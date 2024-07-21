import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'

class ShadeEERare extends Card {
	props: Hermit = {
		...hermit,
		id: 'shadee_rare',
		numericId: 170,
		name: 'Shade E E',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'redstone',
		health: 270,
		primary: {
			name: 'Corrupt Contract',
			cost: ['redstone'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Scale Of Ethics',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: 'If you have less AFK Hermits than your opponent, deal an additional 40hp damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const afkHermits = game.components.filter(
				CardComponent,
				query.card.attached,
				query.card.slot(query.slot.hermit),
				query.card.afk
			)
			const playerAfkHermits = afkHermits.filter((card) => {
				card.player === player
			}).length
			const opponentAfkHermits = afkHermits.filter((card) => {
				card.player === opponentPlayer
			}).length
			if (playerAfkHermits < opponentAfkHermits) {
				attack.addDamage(component.entity, 40)
			}
		})
	}
}

export default ShadeEERare
