import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class RendogRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_rare',
			name: 'Rendog',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: "Comin' At Ya",
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Role Play',
				cost: ['builder', 'builder', 'builder'],
				damage: 0,
				power: 'Ren mimics special move of the opposing Hermit.',
			},
		})

		this.pickOn = 'use-opponent'
	}

	/**
	 * @param {GameModel} game
	 */
	getOpponentsPower(game) {
		const {opponentHermitInfo} = game.ds
		if (!opponentHermitInfo) return null
		const attacks = [opponentHermitInfo.primary, opponentHermitInfo.secondary]
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
			const {
				currentPlayer,
				opponentPlayer,
				playerActiveRow,
				opponentActiveRow,
				opponentHermitCard,
				opponentHermitInfo,
			} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (moveRef.hermitCard.cardId !== this.id) return target
			if (!opponentActiveRow || !opponentActiveRow.hermitCard) return target
			if (!opponentHermitCard) return target
			if (!playerActiveRow || !playerActiveRow.hermitCard) return target

			// Find out if opponent has a special move and if it sprimary or secondary
			const power = this.getOpponentsPower(game)
			if (!power) return target

			// apply opponents damage
			target.extraHermitDamage += power.attack.damage

			// apply opponents power
			const singleUse = currentPlayer.board.singleUseCard
			currentPlayer.board.singleUseCard = null
			// playerActiveRow.hermitCard.cardId = opponentActiveRow.hermitCard.cardId
			const opponentRef = {
				player: opponentPlayer,
				row: opponentActiveRow,
				hermitCard: opponentHermitCard,
				hermitInfo: opponentHermitInfo,
			}
			const result = game.hooks.attack.call(target, turnAction, {
				...attackState,
				typeAction: power.typeAction,
				moveRef: opponentRef,
				condRef: opponentRef,
			})
			// playerActiveRow.hermitCard.cardId = this.id
			currentPlayer.board.singleUseCard = singleUse

			return result
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions) => {
				const {
					playerActiveRow,
					opponentActiveRow,
					playerHermitCard,
					opponentHermitCard,
				} = game.ds
				if (!opponentHermitCard || !playerHermitCard) return availableActions

				// Run only when Ren's card is active
				if (playerHermitCard.cardId !== this.id) return availableActions

				// Both players must have active hermit (null check)
				if (!playerActiveRow?.hermitCard || !opponentActiveRow?.hermitCard)
					return availableActions

				// Don't run logic if Ren can't use his secondary attack
				if (!availableActions.includes('SECONDARY_ATTACK')) {
					return availableActions
				}

				// Don't allow to copy Rens/Cleos cards to avoid loops
				const forbiddenHermits = ['rendog_rare', 'zombiecleo_rare']
				if (forbiddenHermits.includes(opponentHermitCard.cardId)) {
					return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				}

				const power = this.getOpponentsPower(game)

				// Can't use Ren's ability for opponent's common Hermits
				if (!power) {
					return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				}

				// Get available actions for opponents power
				playerActiveRow.hermitCard.cardId = opponentActiveRow.hermitCard.cardId
				const newAvailableActions = game.hooks.availableActions.call(
					availableActions.slice(),
					pastTurnActions
				)
				playerActiveRow.hermitCard.cardId = this.id

				// In case of future cards that would disable primary power
				const hasPrimary = newAvailableActions.includes('PRIMARY_ATTACK')
				if (power.typeAction === 'PRIMARY_ATTACK' && !hasPrimary) {
					return newAvailableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				}

				return newAvailableActions
			}
		)
	}
}

export default RendogRareHermitCard
