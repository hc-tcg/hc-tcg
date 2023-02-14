import HermitCard from './_hermit-card'

// TODO - can't be used consecutively
class BdoubleO100RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_rare',
			name: 'Bdubs',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 260,
			primary: {
				name: 'Retexture',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Shreep',
				cost: ['balanced', 'balanced', 'any'],
				damage: 0,
				power:
					"Bdubs sleeps for the next 2 turns. Can't attack. Restores Full health.\n\nCan still draw and attach cards while sleeping.\n\nCan't be used consecutively.",
			},
		})

		this.turnDuration = 2
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, attackerActiveRow, currentPlayer, typeAction} =
				derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			// e.g. if bed was used
			if (attackerActiveRow.ailments.find(a => a.id === "sleeping")) return target

			if (attackerHermitCard.cardId === this.id) {
				// shreep
				// instantly heal to max hp
				attackerActiveRow.health = this.health

				attackerActiveRow.ailments.push({id: 'sleeping', duration: 2})
			}
			return target
		})
	}
}

export default BdoubleO100RareHermitCard
