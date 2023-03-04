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
	 * @param {TurnAction} turnAction
	 * @param {AttackState} attackState
	 */
	validate(game, turnAction, attackState) {
		const {currentPlayer} = game.ds
		const {moveRef, typeAction, availableActions} = attackState
		const extra = turnAction.payload.extra?.[this.id]

		if (!extra) return

		const allyHermitInfo = CARDS[extra.hermitId]
		const allyRow = currentPlayer.board.rows.find(
			(row) => row.hermitCard?.cardId === extra.hermitId
		)
		if (!allyHermitInfo || !allyRow || !allyRow.hermitCard) return null

		// Find out if opponent has a special move and if it sprimary or secondary
		const power = this.getAllyPower(allyHermitInfo, extra.type)
		if (!power) return

		// Attack must be available
		/** @type {*} */
		const attackKey = allyHermitInfo.id + ':' + power.typeAction
		if (!availableActions.includes(attackKey)) return null

		return {power, allyRow, allyHermitInfo}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attackState.tap(this.id, (turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState
			if (moveRef.hermitCard.cardId !== this.id) return null
			if (typeAction !== 'SECONDARY_ATTACK') return null

			const result = this.validate(game, turnAction, attackState)
			if (!result) return
			const {power, allyRow, allyHermitInfo} = result

			// apply afk hermits power
			attackState.typeAction = power.typeAction
			attackState.moveRef = {
				player: currentPlayer,
				row: allyRow,
				hermitCard: allyRow.hermitCard,
				hermitInfo: allyHermitInfo,
			}
		})

		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {attacker, moveRef} = attackState
			if (attacker.hermitCard.cardId !== this.id) return null
			if (moveRef.hermitCard.cardId === this.id) return null

			const result = this.validate(game, turnAction, attackState)
			if (!result) return
			const {power} = result

			// apply afk hermits damage
			target.extraHermitDamage += power.attack.damage

			return target
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
