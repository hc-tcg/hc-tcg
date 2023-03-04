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
	 * @param {'primary'|'secondary'} type
	 */
	getAllyPower(allyHermitInfo, type) {
		return {
			attack:
				type === 'primary' ? allyHermitInfo.primary : allyHermitInfo.secondary,
			typeAction: type === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK',
		}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, playerActiveRow} = game.ds
			const {attackerHermitCard, typeAction, availableActions} = attackState
			const extra = turnAction.payload.extra?.[this.id]

			if (!extra) return target
			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (attackerHermitCard.cardId !== this.id) return target
			if (!playerActiveRow || !playerActiveRow.hermitCard) return target

			const allyHermitInfo = CARDS[extra.hermitId]
			if (!allyHermitInfo) return null

			// Find out if opponent has a special move and if it sprimary or secondary
			const power = this.getAllyPower(allyHermitInfo, extra.type)
			if (!power) return target

			// Attack must be available
			/** @type {*} */
			const attackKey = allyHermitInfo.id + ':' + power.typeAction
			if (!availableActions.includes(attackKey)) return target

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

				let afkAttacks = afkRows.reduce(
					(/** @type {Array<string>} */ extraActions, row) => {
						if (!row.hermitCard) return
						const allyHermitInfo = CARDS[row.hermitCard.cardId]

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

						if (newAvailableActions.includes('PRIMARY_ATTACK')) {
							extraActions.push(allyHermitInfo.id + ':PRIMARY_ATTACK')
						}
						if (newAvailableActions.includes('SECONDARY_ATTACK')) {
							extraActions.push(allyHermitInfo.id + ':SECONDARY_ATTACK')
						}
						return extraActions
					},
					[]
				)

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
