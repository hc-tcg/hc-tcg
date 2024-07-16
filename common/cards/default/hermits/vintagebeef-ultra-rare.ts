import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card} from '../../../components/query'
import BdoubleO100Common from './bdoubleo100-common'
import BdoubleO100Rare from './bdoubleo100-rare'
import Docm77Common from './docm77-common'
import Docm77Rare from './docm77-rare'
import EthosLabCommon from './ethoslab-common'
import EthosLabRare from './ethoslab-rare'
import EthosLabUltraRare from './ethoslab-ultra-rare'

class VintageBeefUltraRare extends Card {
	props: Hermit = {
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
			power: 'If you have AFK Docm77, Bdubs AND Etho on the game board, attack damage doubles.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const hasBdubs = game.components.find(
				CardComponent,
				card.currentPlayer,
				card.is(BdoubleO100Common, BdoubleO100Rare)
			)
			const hasDoc = game.components.find(
				CardComponent,
				card.currentPlayer,
				card.is(Docm77Common, Docm77Rare)
			)
			const hasEtho = game.components.find(
				CardComponent,
				card.currentPlayer,
				card.is(EthosLabCommon, EthosLabRare, EthosLabUltraRare)
			)

			if (hasBdubs && hasDoc && hasEtho) attack.multiplyDamage(component.entity, 2)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default VintageBeefUltraRare
