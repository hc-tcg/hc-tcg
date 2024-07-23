import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class GoldenAxe extends Card {
	selectionAvailable = false

	props: SingleUse = {
		...singleUse,
		id: 'golden_axe',
		numericId: 31,
		name: 'Golden Axe',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description:
			"Do 40hp damage to your opponent's active Hermit.\nAny effect card attached to your opponent's active Hermit is ignored during this turn.",
		hasAttack: true,
		attackPreview: (_game) => '40',
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const axeAttack = game
				.newAttack({
					attacker: component.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			return axeAttack
		})

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.isAttacker(component.entity)) {
				applySingleUse(game)
			}

			attack.shouldIgnoreCards.push(
				query.card.slot(query.every(query.slot.opponent, query.slot.attach, query.slot.active))
			)
		})
	}
}

export default GoldenAxe
