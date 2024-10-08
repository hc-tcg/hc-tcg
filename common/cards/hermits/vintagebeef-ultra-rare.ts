import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'
import BdoubleO100Common from './bdoubleo100-common'
import BdoubleO100Rare from './bdoubleo100-rare'
import Docm77Common from './docm77-common'
import Docm77Rare from './docm77-rare'
import EthosLabCommon from './ethoslab-common'
import EthosLabRare from './ethoslab-rare'
import EthosLabUltraRare from './ethoslab-ultra-rare'

const VintageBeefUltraRare: Hermit = {
	...hermit,
	id: 'vintagebeef_ultra_rare',
	numericId: 104,
	name: 'Beef',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 2,
	type: 'explorer',
	health: 280,
	primary: {
		name: 'Back in Action',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'N.H.O',
		cost: ['explorer', 'explorer', 'explorer'],
		damage: 100,
		power:
			'If you have AFK Docm77, Bdubs AND Etho on the game board, attack damage doubles.',
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

				const hasBdubs = game.components.exists(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(BdoubleO100Common, BdoubleO100Rare),
					query.card.attached,
				)
				const hasDoc = game.components.exists(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(Docm77Common, Docm77Rare),
					query.card.attached,
				)
				const hasEtho = game.components.exists(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(EthosLabCommon, EthosLabRare, EthosLabUltraRare),
					query.card.attached,
				)

				if (hasBdubs && hasDoc && hasEtho)
					attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default VintageBeefUltraRare
