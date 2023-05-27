import HermitCard from './_hermit-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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
					'Does an additional +40HP damage for every other AFK Boomer (Bdubs, Tango) up to a maximum of +80HP damage.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {condRef, moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const boomerRows = condRef.player.board.rows.filter((row) => {
				const isBdubs = row.hermitCard?.cardId.startsWith('bdoubleo100')
				const isTango = row.hermitCard?.cardId.startsWith('tangotek')
				return isBdubs || isTango
			})
			const total = Math.min(boomerRows.length, 2)
			target.extraHermitDamage += total * 40

			return target
		})
	}
}

export default ImpulseSVRareHermitCard
