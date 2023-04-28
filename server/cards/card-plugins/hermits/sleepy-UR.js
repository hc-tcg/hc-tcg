import CharacterCard from './_hermit-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SleepyURCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'sleepy-UR',
			name: 'sleepy-UR',
			rarity: 'ultra-rare',
			hermitType: 'iceCream',
			health: 250,
			primary: {
				name: 'Eat Ice Cream',
				cost: ['iceCream','IceCream'],
				damage: 50,
				power: 'Does an additional +40HP damage for every ice cream dealer on the bench up to a maximum of +80HP damage.',
			},
			secondary: {
				name: 'Slep',
				cost: ['iceCream', 'iceCream','iceCream'],
				damage: 100,
				power:
					'CODE GONE TO TIM BOT 2 (for now its 100 power)',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {
				attackerCharacterCard,
				attackerCharacterInfo,
				typeAction,
				attackerActiveRow,
			} = attackState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerCharacterCard.cardId !== this.id) return target

			const dealerRows = currentPlayer.board.rows.filter((row) => {
				const isDealer = row.characterCard?.cardId.startsWith('andrew-IceCreamDealer')
				return isDealer
			})
			const total = Math.min(dealerRows.length, 2)
			target.extraCharacterDamage += total * 40

			return target
		})
	}
}

export default SleepyURCharacterCard
