import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card} from '../../../components/query'

/*
- Beef confirmed that double damage condition includes other rare mumbos.
*/
class MumboJumboRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'mumbojumbo_rare',
		numericId: 81,
		name: 'Mumbo',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'prankster',
		health: 290,
		primary: {
			name: 'Moustache',
			cost: ['prankster'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Quite Simple',
			cost: ['prankster', 'prankster'],
			damage: 40,
			power:
				'Flip a coin twice. Do an additional 20hp damage for every heads. Total attack damage doubles if you have at least one other AFK Prankster.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, component, 2)
			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			const pranksterAmount = game.components.filter(
				CardComponent,
				card.currentPlayer,
				card.afk,
				card.type('prankster')
			).length

			attack.addDamage(component.entity, headsAmount * 20)
			if (pranksterAmount > 0) attack.multiplyDamage(component.entity, 2)
		})
	}
}

export default MumboJumboRare
