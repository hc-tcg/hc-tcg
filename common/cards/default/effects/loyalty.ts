import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import {card, slot} from '../../../components/query'

class  extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		const afterAttack = (_attack: AttackModel) => {
			game.components
				.filter(CardComponent, card.currentPlayer, card.slot(slot.itemSlot))
				.forEach((card) => card.draw())
		}

		player.hooks.afterAttack.add(component, (attack) => afterAttack(attack))
		opponentPlayer.hooks.afterAttack.add(component, (attack) => afterAttack(attack))
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		player.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.afterAttack.remove(component)
	}
}

export default 
