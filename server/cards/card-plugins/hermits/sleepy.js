import CharacterCard from './_character-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO - can't be used consecutively
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
					'Does an additional +20HP damage for every benched Ice Cream Dealer up to a maximum of +40HP damage.',
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

			const iceCreamDealerRows = currentPlayer.board.rows.filter((row) => {
				const isIceCreamDealer = row.characterCard?.cardId.startsWith('iceCreamDealer')
				return isIceCreamDealer
			})
			const total = Math.min(iceCreamDealerRows.length, 2)
			target.extraHermitDamage += total * 20

			return target
			},
				      
				      
			secondary: {
				name: 'Sleep',
				cost: ['icecream', 'icecream', 'icecream'],
				damage: 0,
				power:
					"Sleepy sleeps for the next turn. Can't attack. Restores Full health.\n\nCan still draw and attach cards while sleeping.\n\nCan't be used consecutively.",
			},
		})

		this.turnDuration = 1
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {attackerCharacterCard, attackerActiveRow, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerCharacterCard.cardId !== this.id) return target
			// shreep - instantly heal to max hp

			// e.g. if bed was used
			if (attackerActiveRow.ailments.find((a) => a.id === 'sleeping'))
				return target

			// store current turn to disable Shreep for one turn when it is over
			const conInfo = currentPlayer.custom[this.id] || {}
			conInfo[attackerCharacterCard.cardInstance] = game.state.turn
			currentPlayer.custom[this.id] = conInfo

			attackerActiveRow.health = this.health
			attackerActiveRow.ailments = attackerActiveRow.ailments.filter(
				(a) => a.id !== 'sleeping'
			)
			attackerActiveRow.ailments.push({id: 'sleeping', duration: 1})
		})

		// Disable shreep attack consecutively
		game.hooks.availableActions.tap(this.id, (availableActions) => {
			const {currentPlayer} = game.ds

			// we must have active hermit
			const activeCharacter =
				currentPlayer.board.rows[currentPlayer.board.activeRow]?.characterCard
			if (activeCharacter?.cardId !== this.id) return availableActions

			// we want to make changes only if shreep was used by the hermit
			const conInfo = currentPlayer.custom[this.id]
			const lastTurnUsed = conInfo?.[activeCharacter.cardInstance]
			if (typeof lastTurnUsed !== 'number') return availableActions

			// Prevent use of shreep consecutively
			const consecutive = lastTurnUsed + 6 >= game.state.turn
			if (!consecutive) {
				delete conInfo[activeCharacter.cardInstance]
				return availableActions
			}

			return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
		})
	}
}

export default SleepyCharacterCard
