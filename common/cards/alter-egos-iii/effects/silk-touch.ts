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
			"When one of your opponent's Hermit is knocked out by your Hermit that this card is attached to, pick 2 attached item cards from the opposing active Hermit and add them to your hand.",
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
