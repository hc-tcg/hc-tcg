import EffectCard from '..//base/effect-card'
import {isTargetingPos} from '../../utils/attacks'
import {GameModel} from '../../models/game-model'
import {discardCard} from '../../utils/movement'
import {CardPosModel} from '../../models/card-pos-model'

class ArmorStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'armor_stand',
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
			player.board.activeRow = pos.rowIndex
		}

		// The menu won't show up but just in case someone tries to cheat
		player.hooks.blockedActions.add(
			instance,
			(blockedActions, pastTurnActions, availableEnergy) => {
				if (player.board.activeRow === pos.rowIndex) {
					blockedActions.push('PRIMARY_ATTACK')
					blockedActions.push('SECONDARY_ATTACK')
					blockedActions.push('ZERO_ATTACK')
				}

				return blockedActions
			}
		)

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			if (!row.health && attack.attacker && isTargetingPos(attack, pos)) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
				// Reset the active row so the player can switch
				player.board.activeRow = null
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos
		// Just in case we decide that Fire Charge/Mending/etc work on an Armor Stand that
		// is attached to a Hermit slot
		if (slot && slot.type === 'hermit' && row) {
			row.health = null
		}

		player.hooks.blockedActions.remove(instance)
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

	/**
	 * @param {GameModel} game
	 * @param {import('types/cards').CardPos} pos
	 */
	override canAttachToCard(game: GameModel, pos: CardPosModel) {
		return false
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override showAttachTooltip() {
		return false
	}
}

export default ArmorStandEffectCard
