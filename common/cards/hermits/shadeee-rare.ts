import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const ShadeEERare: Hermit = {
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
		power:
			'If you have fewer AFK Hermits than your opponent, do an additional 40hp damage.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const playerAfkHermits = game.components.filter(
					CardComponent,
					query.card.player(player.entity),
					query.card.slot(query.slot.hermit),
					query.card.afk,
				).length

				const opponentAfkHermits = game.components.filter(
					CardComponent,
					query.card.player(opponentPlayer.entity),
					query.card.slot(query.slot.hermit),
					query.card.afk,
				).length

				if (playerAfkHermits < opponentAfkHermits) {
					attack.addDamage(component.entity, 40)
				}
			},
		)
	},
}

export default ShadeEERare
