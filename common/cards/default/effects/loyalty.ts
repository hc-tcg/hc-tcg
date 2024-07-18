import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import {card, slot} from '../../../components/query'

class Loyalty extends Card {
	props: Attach = {
		...attach,
		id: 'loyalty',
		numericId: 77,
		name: 'Loyalty',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		description:
			'When the Hermit that this card is attached to is knocked out, all attached item cards are returned to your hand.',
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		const afterAttack = (_attack: AttackModel) => {
			game.components
				.filter(CardComponent, card.currentPlayer, card.slot(slot.item))
				.forEach((card) => card.draw())
		}

		observer.subscribe(player.hooks.afterAttack, (attack) => afterAttack(attack))
		observer.subscribe(opponentPlayer.hooks.afterAttack, (attack) => afterAttack(attack))
	}
}

export default Loyalty
