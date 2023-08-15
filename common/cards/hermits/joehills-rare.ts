import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {TurnActions} from '../../types/game-state'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'

class JoeHillsRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_rare',
			name: 'Joe',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Grow Hills',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Time Skip',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power:
					'Flip a coin. If heads, opponent skips their next turn. "Time Skip" can not be used statusly.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		player.custom[status] = 'normal'

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (player.custom[status] != 'normal') {
				player.custom[status] = 'normal'
				return
			}
			if (attack.type !== 'secondary') return
			player.custom[status] = 'block'

			const coinFlip = flipCoin(player, this.id, 1)
			if (coinFlip[0] !== 'heads') return

			// Block all the actions of the opponent
			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
				const blocked: TurnActions = [
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD',
				]

				if (opponentPlayer.board.activeRow !== null) {
					blocked.push('CHANGE_ACTIVE_HERMIT')
				}
				blockedActions.push(...blocked)
				return blockedActions
			})

			// Stop blocking the actions of the opponent when their turn ends
			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})

		// Block the secondary attack of Joe
		player.hooks.blockedActions.add(instance, (blockedActions) => {
			if (player.custom[status] === 'normal') return blockedActions
			/** @type {TurnActions}*/
			const blocked: TurnActions = ['SECONDARY_ATTACK']
			blockedActions.push(...blocked)

			return blockedActions
		})

		// Advance the status flag at the start of your turn after time skip
		player.hooks.onTurnStart.add(instance, () => {
			if (player.custom[status] !== 'block') return
			player.custom[status] = 'blocked'
		})

		// If you didn't attack or switched your active hermit, reset the status flag
		player.hooks.onTurnEnd.add(instance, () => {
			if (player.custom[status] !== 'blocked') return
			player.custom[status] = 'normal'
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		player.hooks.blockedActions.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		delete player.custom[status]
	}
}

export default JoeHillsRareHermitCard
