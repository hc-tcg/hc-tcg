import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class VintageBeefUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_ultra_rare',
			name: 'Beef',
			rarity: 'ultra_rare',
			hermitType: 'explorer',
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
				power: 'If you have Doc, Bdubs AND Etho, attack damage doubles.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const hasBdubs = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('bdoubleo100')
			)
			const hasDoc = player.board.rows.some((row) => row.hermitCard?.cardId?.startsWith('docm77'))
			const hasEtho = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('ethoslab')
			)

			if (hasBdubs && hasDoc && hasEtho) attack.addDamage(this.id, attack.getDamage())
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		delete player.hooks.onAttack[instance]
	}
}

export default VintageBeefUltraRareHermitCard
