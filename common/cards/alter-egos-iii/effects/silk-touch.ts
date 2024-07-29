import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import * as query from '../../../components/query'

class SilkTouch extends Card {
	props: Attach = {
		...attach,
		id: 'silk_touch',
		numericId: 189,
		name: 'Silk Touch',
		expansion: 'alter_egos_iii',
		rarity: 'rare',
		tokens: 0,
		description:
			'Attach to your active Hermit. If a single use effect card is used while this card is attached to your active Hermit, discard Silk Touch instead and shuffle the single use effect card back into your deck.',
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		const afterAttack = (_attack: AttackModel) => {
			if (!component.slot.inRow() || component.slot.row.health) return

			game.components
				.filter(
					CardComponent,
					query.card.player(player.entity),
					query.card.active,
					query.card.slot(query.slot.item)
				)
				.forEach((card) => card.draw())
		}

		observer.subscribe(player.hooks.afterAttack, (attack) => afterAttack(attack))
		observer.subscribe(opponentPlayer.hooks.afterAttack, (attack) => afterAttack(attack))
	}
}

export default SilkTouch
