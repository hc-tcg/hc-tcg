import CharacterCard from './_character-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SleepyCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'sleepy',
			name: 'Sleepy',
			rarity: 'ultra_rare',
			characterType: 'iceCream',
			health: 250,
			primary: {
				name: 'Eat Ice Cream',
				cost: ['icecream', 'icecream'],
				damage: 50,
				power: 
					'Does an additional +40HP damage for every benched Ice Cream Dealer up to a maximum of +80HP damage.',
				},
			secondary: {
				name: 'Sleep',
				cost: ['icecream', 'icecream', 'icecream'],
				damage: 0,
				power:
					"SORRY THIS CODE HAS BEEN SENT FAR FAR AWAY",
			},
		})
	}

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

export default SleepyCharacterCard
