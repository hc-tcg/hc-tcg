import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const hasBdubs = player.board.rows.some((row) =>
				row.hermitCard?.props.name.startsWith('bdoubleo100')
			)
			const hasDoc = player.board.rows.some((row) =>
				row.hermitCard?.props.name.startsWith('docm77')
			)
			const hasEtho = player.board.rows.some((row) =>
				row.hermitCard?.props.name.startsWith('ethoslab')
			)

			if (hasBdubs && hasDoc && hasEtho) attack.addDamage(this.props.id, attack.getDamage())
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default VintageBeefUltraRare
