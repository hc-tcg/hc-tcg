import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

// - Game should not consume attached totem if deathloop is active
// - Golden Axe should not bypass deathloop (unlike a totem)
// - Needs to work for death by being attack or by death by ailments
class GoodTimesWithScarRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_rare',
			name: 'Scar',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Scarred For Life',
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deathloop',
				cost: ['builder', 'any'],
				damage: 70,
				power:
					'If Scar is knocked out the following turn, flip a coin.\n\nIf heads, Scar is revived with +50HP.\n\nCan only be revived once.',
			},
		})

		this.recoverAmount = 50
	}

	register(game) {
		// scar attacks
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			currentPlayer.custom[this.id] = 1

			return target
		})

		game.hooks.hermitDeath.tap(this.id, (recovery, deathInfo) => {
			const {playerState, row} = deathInfo
			if (row.hermitCard.cardId !== this.id) return
			if (playerState.custom[this.id] !== 2) return

			recovery.push({amount: this.recoverAmount})
			return recovery
		})

		// turnStart to maker ailments work?
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (currentPlayer.custom[this.id] === 1) {
				currentPlayer.custom[this.id] = 2
			} else {
				delete currentPlayer.custom[this.id]
			}
		})
	}
}

export default GoodTimesWithScarRareHermitCard
