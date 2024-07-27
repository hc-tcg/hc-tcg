import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Mace extends Card {
	selectionAvailable = false

	props: SingleUse = {
		...singleUse,
		id: 'mace',
		numericId: 188,
		name: 'Mace',
		expansion: 'alter_egos_iii',
		rarity: 'rare',
		tokens: 2,
		description:
			"Do 20hp damage for every item card attached to your opponent's active Hermit, up to a maximum of 80hp damage.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			let itemNumber = game.components
				.filter(CardComponent, query.card.active, query.card.isItem)
				.reduce((sum, item) => {
					if (item.isItem()) {
						return sum + item.props.energy.length
					} else {
						return 1
					}
				}, 0)

			const axeAttack = game
				.newAttack({
					attacker: component.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)
				.addDamage(component.entity, Math.min(itemNumber * 20, 80))

			return axeAttack
		})
	}
}

export default Mace
