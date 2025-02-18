import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const EthosLabUltraRare: Hermit = {
	...hermit,
	id: 'ethoslab_ultra_rare',
	numericId: 21,
	name: 'Etho',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 3,
	type: 'pvp',
	health: 250,
	primary: {
		name: 'Ladders',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Slab',
		cost: ['any', 'any'],
		damage: 70,
		power:
			'Flip a coin 3 times.\nDo an additional 20hp damage for every heads.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!(attack.attacker instanceof CardComponent)) return
				if (!attack.attacker.slot.inRow()) return

				const coinFlip = flipCoin(game, player, attack.attacker, 3)
				const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
				attack.addDamage(component.entity, headsAmount * 20)
			},
		)
	},
}

export default EthosLabUltraRare
