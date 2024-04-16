import EffectCard from '../../base/effect-card'
import {isTargetingPos} from '../../../utils/attacks'
import {GameModel} from '../../../models/game-model'
import {discardCard} from '../../../utils/movement'
import {CardPosModel} from '../../../models/card-pos-model'
import {TurnActions} from '../../../types/game-state'

class ArmorStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'armor_stand',
			numericId: 118,
			name: 'Armour Stand',
			rarity: 'ultra_rare',
			description:
				"Use like a Hermit card. Has 50hp.\n\nCan not attack. Can not attach cards to it.\nOpponent does not get a point when it's knocked out.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos
		if (!row) return

		row.health = 50
		if (player.board.activeRow === null) {
			game.changeActiveRow(player, pos.rowIndex)
		}

		// The menu won't show up but just in case someone tries to cheat
		player.hooks.blockedActions.add(instance, (blockedActions) => {
			if (player.board.activeRow === pos.rowIndex) {
				blockedActions.push('PRIMARY_ATTACK')
				blockedActions.push('SECONDARY_ATTACK')
				blockedActions.push('SINGLE_USE_ATTACK')
			}

			return blockedActions
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (!row.health && attacker && isTargetingPos(attack, pos)) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)

				const activeRow = player.board.activeRow
				const isActive = activeRow !== null && activeRow == pos.rowIndex
				if (isActive && attacker.player.id !== player.id) {
					// Reset the active row so the player can switch
					game.changeActiveRow(player, null)
				}
			}
		})

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (!row.health && attacker && isTargetingPos(attack, pos)) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)

				const activeRow = player.board.activeRow
				const isActive = activeRow !== null && activeRow == pos.rowIndex
				if (isActive && attacker.player.id !== player.id) {
					// Reset the active row so the player can switch
					game.changeActiveRow(player, null)
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos
		if (slot && slot.type === 'hermit' && row) {
			row.health = null
			row.effectCard = null
			row.itemCards = row.itemCards.map(() => null)
		}

		player.hooks.blockedActions.remove(instance)
		player.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {slot} = pos
		const {currentPlayer} = game

		if (!slot || slot.type !== 'hermit') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		return 'YES'
	}

	override canAttachToCard(game: GameModel, pos: CardPosModel) {
		return false
	}

	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there a hermit slot free on the board
		const spaceForHermit = currentPlayer.board.rows.some((row) => !row.hermitCard)

		return spaceForHermit ? ['PLAY_HERMIT_CARD'] : []
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override showAttachTooltip() {
		return false
	}
}

export default ArmorStandEffectCard
