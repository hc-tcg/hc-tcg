import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class ImpulseSVRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'impulsesv_rare',
			name: 'Impulse',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 250,
			primary: {
				name: 'Bop',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Boomer',
				cost: ['redstone', 'any'],
				damage: 70,
				power:
					'Does an additional +40HP damage for every AFK Boomer (Bdubs, Tango) up to a maximum of +80HP damage.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				currentPlayer,
				typeAction,
				attackerActiveRow,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const hasBdubs = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('bdoubleo100')
			)
			const hasTango = currentPlayer.board.rows.some((row) =>
				row.hermitCard?.cardId.startsWith('tangotek')
			)

			if (hasBdubs) target.damage += 40
			if (hasTango) target.damage += 40

			return target
		})
	}
}

export default ImpulseSVRareHermitCard
