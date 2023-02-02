import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

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

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const hasBdubs = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('bdoubleo100')
			)
			const hasDoc = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('docm77')
			)
			const hasEtho = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('ethoslab')
			)

			if (hasBdubs && hasDoc && hasEtho) target.multiplier *= 2

			return target
		})
	}
}

export default VintageBeefUltraRareHermitCard
