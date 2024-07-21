import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class EthosLabUltraRare extends Card {
	props: Hermit = {
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
			power: 'Flip a coin 3 times.\nDo an additional 20hp damage for every heads.',
		},
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!(attack.attacker instanceof CardComponent)) return
			if (!attack.attacker.slot.inRow()) return

			const coinFlip = flipCoin(player, attack.attacker, 3)
			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			attack.addDamage(component.entity, headsAmount * 20)
		})
	}
}

export default EthosLabUltraRare
