import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'
import EthosLabCommon from './ethoslab-common'
import EthosLabRare from './ethoslab-rare'
import EthosLabUltraRare from './ethoslab-ultra-rare'
import GeminiTayCommon from './geminitay-common'
import GeminiTayRare from './geminitay-rare'

const SmallishbeansRare: Hermit = {
	...hermit,
	id: 'smallishbeans_rare',
	numericId: 267,
	name: 'Joel',
	expansion: 'season_x',
	rarity: 'rare',
	tokens: 1,
	type: ['explorer'],
	health: 260,
	primary: {
		name: 'Neck Kisses',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Obsess',
		cost: ['explorer', 'explorer', 'any'],
		damage: 90,
		power:
			'For each of your AFK Ethos or Gems on the game board, do an additional 10hp damage.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const obsessionAmount = game.components.filter(
					CardComponent,
					query.card.attached,
					query.card.is(
						EthosLabCommon,
						EthosLabRare,
						EthosLabUltraRare,
						GeminiTayCommon,
						GeminiTayRare,
					),
					query.card.currentPlayer,
					query.not(query.card.active),
				).length

				attack.addDamage(component.entity, obsessionAmount * 10)
			},
		)
	},
}

export default SmallishbeansRare
