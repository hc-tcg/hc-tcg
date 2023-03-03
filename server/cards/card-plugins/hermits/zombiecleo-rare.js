import HermitCard from './_hermit-card'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ZombieCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_rare',
			name: 'Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 290,
			primary: {
				name: 'Dismissed',
				cost: ['pvp'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Puppetry',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 0,
				power: 'Player uses a move from any of their AFK Hermits.',
			},
		})

		this.pickOn = 'use-ally'
		this.pickReqs = [
			{target: 'player', type: 'hermit', amount: 1, active: false},
		]
	}

	/**
	 * @param {*} allyHermitInfo
	 */
	getAllyPower(allyHermitInfo) {
		const attacks = [allyHermitInfo.primary, allyHermitInfo.secondary]
		const powerIndex = attacks.findIndex((a) => a.power)
		if (powerIndex === -1) return null
		return {
			attack: attacks[powerIndex],
			typeAction: powerIndex === 0 ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK',
		}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, playerActiveRow} = game.ds
			const {attackerHermitCard, typeAction, pickedCardsInfo} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (attackerHermitCard.cardId !== this.id) return target
			if (!playerActiveRow || !playerActiveRow.hermitCard) return target

			const cleoPickedCards = pickedCardsInfo[this.id]
			if (!cleoPickedCards || !cleoPickedCards.length) return null
			const pickedCard = cleoPickedCards[0]
			if (!pickedCard || !pickedCard.row.hermitCard) return null
			const allyHermitInfo = CARDS[pickedCard.row.hermitCard.cardId]
			if (!allyHermitInfo) return null

			// Find out if opponent has a special move and if it sprimary or secondary
			const power = this.getAllyPower(allyHermitInfo)
			if (!power) return target

			// apply afk hermits damage
			target.extraHermitDamage += power.attack.damage

			// apply afk hermits power
			const singleUse = currentPlayer.board.singleUseCard
			currentPlayer.board.singleUseCard = null
			playerActiveRow.hermitCard.cardId = allyHermitInfo.id
			const result = game.hooks.attack.call(target, turnAction, {
				...attackState,
				typeAction: power.typeAction,
			})
			playerActiveRow.hermitCard.cardId = this.id
			currentPlayer.board.singleUseCard = singleUse

			return result
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions) => {
				const {currentPlayer, playerActiveRow, playerHermitCard} = game.ds

				// Run only when Cleo's card is active
				if (playerHermitCard?.cardId !== this.id) return availableActions
				if (!playerActiveRow?.hermitCard) return availableActions

				// Don't run logic if Cleo can't use his secondary attack
				if (!availableActions.includes('SECONDARY_ATTACK')) {
					return availableActions
				}

				// Get valid AFK hermits
				const forbiddenHermits = ['rendog_rare', 'zombiecleo_rare']
				const afkRows = currentPlayer.board.rows.filter((row, index) => {
					if (!row.hermitCard) return false
					if (index === currentPlayer.board.activeRow) return false
					if (forbiddenHermits.includes(row.hermitCard.cardId)) return false
					return true
				})

				let afkAttacks = afkRows
					.map((row) => {
						if (!row.hermitCard) return null
						const allyHermitInfo = CARDS[row.hermitCard.cardId]
						const power = this.getAllyPower(allyHermitInfo)
						if (!power) return null

						// Get available actions for opponents power
						playerActiveRow.hermitCard.cardId = allyHermitInfo.id
						const newAvailableActions = game.hooks.availableActions.call(
							availableActions.slice(),
							pastTurnActions
						)
						playerActiveRow.hermitCard.cardId = this.id

						const hasPrimary = newAvailableActions.includes('PRIMARY_ATTACK')
						const hasSecondary =
							newAvailableActions.includes('SECONDARY_ATTACK')

						if (power.typeAction === 'PRIMARY_ATTACK' && hasPrimary) {
							return allyHermitInfo.id + ':PRIMARY_ATTACK'
						} else if (
							power.typeAction === 'SECONDARY_ATTACK' &&
							hasSecondary
						) {
							return allyHermitInfo.id + ':SECONDARY_ATTACK'
						}
						return null
					})
					.filter(Boolean)

				// remove duplicates
				afkAttacks = Array.from(new Set(afkAttacks))

				if (!afkAttacks.length) {
					return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				}

				return availableActions.concat(
					/** @type {AvailableAction[]} */ (afkAttacks)
				)
			}
		)
	}
}

export default ZombieCleoRareHermitCard
