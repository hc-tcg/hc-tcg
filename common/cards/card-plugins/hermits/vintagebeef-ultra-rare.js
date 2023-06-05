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
				power:
					'If user has Doc, Bdubs, and Etho as AFK, attack damage doubles.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return
			const hasBdubs = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('bdoubleo100')
			)
			const hasDoc = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('docm77')
			)
			const hasEtho = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('ethoslab')
			)
			if (hasBdubs && hasDoc && hasEtho) attack.multiplyDamage(2)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		// Remove hooks
		delete currentPlayer.hooks.onAttack[instance]
	}
}

export default VintageBeefUltraRareHermitCard
