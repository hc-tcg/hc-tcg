import {CardComponent} from '../components'
import {Counter, statusEffect} from './status-effect'

const SmeltingEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'smelting',
	icon: 'smelting',
	name: 'Smelting',
	description:
		'When the counter reaches 0, upgrades all item cards attached to this Hermit to double items',
	counter: 4,
	counterType: 'turns',

	// override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component

	// 	player.hooks.onTurnStart.add(instance, () => {
	// 		if (instance.counter === null) return
	// 		instance.counter -= 1
	// 		if (instance.counter === 0) {
	// 			discardCard(game, pos.cardId)
	// 			pos.rowId?.itemCards.forEach((card) => {
	// 				if (!card) return
	// 				card.card.props.numericId = card.card.props.numericId.replace('common', 'rare')
	// 			})
	// 		}
	// 	})
	// }

	// override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component

	// 	player.hooks.onTurnStart.remove(instance)
	// }
}

export default SmeltingEffect
