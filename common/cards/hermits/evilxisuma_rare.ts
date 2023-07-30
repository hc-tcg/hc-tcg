import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import HermitCard from '../base/hermit-card'

class EvilXisumaRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'evilxisuma_rare',
			name: 'Evil X',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 280,
			primary: {
				name: 'Evil Inside',
				cost: [],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Derpcoin',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power:
					"Flip a coin.\n\nIf heads, choose one of the opposing active Hermit's attacks to disable on their next turn.",
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.target) return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] !== 'heads') return

			player.followUp[instanceKey] = this.id

			// He only disables the attack of the target, that means that
			// lightning rod counters him and using knockback/target block
			// is a really bad idea
			player.custom[this.getInstanceKey(instance, 'target')] = attack.target.rowIndex

			// It's easier to not duplicate the code if I use the hooks here
			player.hooks.onFollowUp.add(instance, (followUp, pickedSlots, modalResult) => {
				if (followUp !== instanceKey) return
				player.hooks.onFollowUp.remove(instance)
				player.hooks.onFollowUpTimeout.remove(instance)
				delete player.followUp[instanceKey]

				if (!modalResult || !modalResult.disable) return

				player.custom[this.getInstanceKey(instance, 'disable')] = modalResult.disable
			})

			player.hooks.onFollowUpTimeout.add(instance, (followUp) => {
				if (followUp !== instanceKey) return
				player.hooks.onFollowUpTimeout.remove(instance)
				player.hooks.onFollowUpTimeout.remove(instance)
				delete player.followUp[instanceKey]

				// Disable the secondary attack if the player didn't choose one
				player.custom[this.getInstanceKey(instance, 'disable')] = 'secondary'
			})

			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
				const disable = player.custom[this.getInstanceKey(instance, 'disable')]
				const targetRow = player.custom[this.getInstanceKey(instance, 'target')]
				if (!disable) return blockedActions

				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null || targetRow === null) return blockedActions
				if (activeRow !== targetRow) return blockedActions

				blockedActions.push(disable === 'primary' ? 'PRIMARY_ATTACK' : 'SECONDARY_ATTACK')

				return blockedActions
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
				delete player.custom[this.getInstanceKey(instance, 'disable')]
				delete player.custom[this.getInstanceKey(instance, 'target')]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default EvilXisumaRareHermitCard
