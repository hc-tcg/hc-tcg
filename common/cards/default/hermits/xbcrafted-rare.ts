import {CardPosModel, getBasicCardPos, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import HermitCard from '../../base/hermit-card'
import {getActiveRowPos} from '../../../utils/board'
import {slot} from '../../../slot'

class XBCraftedRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xbcrafted_rare',
			numericId: 110,
			name: 'xB',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 270,
			primary: {
				name: 'Giggle',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Noice!',
				cost: ['explorer', 'any'],
				damage: 70,
				power:
					"Any effect card attached to your opponent's active Hermit is ignored during this turn.",
			},
		})
	}

	override getAttack(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttack(game, instance, pos, hermitAttackType)
		if (!attack) return null

		if (attack.type === 'secondary') {
			// Noice attack, set flag to ignore target effect card
			pos.player.custom[this.getInstanceKey(instance, 'ignore')] = true
		}

		return attack
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const ignoreKey = this.getInstanceKey(instance, 'ignore')

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			if (!player.custom[ignoreKey]) return
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return

			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreSlots.push(slot.every(slot.opponent, slot.effectSlot, slot.activeRow))
		})

		player.hooks.onTurnEnd.add(instance, () => {
			// Remove ignore flag
			if (player.custom[ignoreKey]) {
				delete player.custom[ignoreKey]
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default XBCraftedRareHermitCard
