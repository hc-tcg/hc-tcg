import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const Docm77Rare: Hermit = {
	...hermit,
	id: 'docm77_rare',
	numericId: 11,
	name: 'Docm77',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: ['farm'],
	health: 280,
	primary: {
		name: 'Shadow Tech',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'World Eater',
		cost: ['farm', 'farm'],
		damage: 80,
		power:
			'Flip a coin.\nIf heads, attack damage doubles.\nIf tails, attack damage is halved.',
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

				const coinFlip = flipCoin(game, player, attack.attacker)

				if (coinFlip[0] === 'heads') {
					attack.addDamage(component.entity, this.secondary.damage)
				} else {
					attack.removeDamage(component.entity, this.secondary.damage / 2)
				}
			},
		)
	},
}

export default Docm77Rare
