import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const JackCommon: Hermit = {
	...hermit,
	id: 'jack_rare',
	numericId: 132,
	name: 'Jack',
	expansion: 'shifttech',
	rarity: 'rare',
	tokens: 1,
	type: ['builder'],
	health: 270,
	primary: {
		name: 'False Chunk',
		cost: ['builder'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Rebuild',
		cost: ['builder', 'builder', 'any'],
		damage: 90,
		power: 'Flip a coin.\nIf heads, draw an extra item card from your deck.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!(attack.attacker instanceof CardComponent)) return

				const coinFlip = flipCoin(player, attack.attacker)

				if (coinFlip[0] === 'heads') {
					const playerDeck = player.getDeck().sort(CardComponent.compareOrder)

					let item: CardComponent | null = null

					let i = 0
					while (!playerDeck[i].isItem() && i < playerDeck.length) {
						i += 1
					}
					if (i < playerDeck.length) {
						item = playerDeck[i]
					}

					if (item) {
						item.draw()
					}
				}
			},
		)
	},
}

export default JackCommon
