import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

/*
- Beef confirmed that double damage condition includes other rare mumbos.
*/
const MumboJumboRare: Hermit = {
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
			'Flip a coin twice.\nDo an additional 20hp damage for every heads. Total attack damage doubles if you have at least one AFK Prankster on the game board.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const coinFlip = flipCoin(player, component, 2)
			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			const pranksterAmount = game.components.filter(
				CardComponent,
				query.card.currentPlayer,
				query.card.afk,
				query.card.type('prankster'),
			).length

			attack.addDamage(component.entity, headsAmount * 20)
			if (pranksterAmount > 0) attack.multiplyDamage(component.entity, 2)
		})
	},
}

export default MumboJumboRare
