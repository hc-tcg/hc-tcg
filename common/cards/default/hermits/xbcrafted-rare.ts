import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {getActiveRowPos} from '../../../utils/board'
import {slot} from '../../../slot'
import Card, {Hermit, InstancedValue, hermit} from '../../base/card'
import {CardInstance} from '../../../types/game-state'

class XBCraftedRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'xbcrafted_rare',
		numericId: 110,
		name: 'xB',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
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
	}

	ignoreEffectCard = new InstancedValue(false)

	override getAttack(
		game: GameModel,
		instance: CardInstance,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttack(game, instance, pos, hermitAttackType)
		if (!attack) return null

		if (attack.type === 'secondary') {
			// Noice attack, set flag to ignore target effect card
			this.ignoreEffectCard.set(instance, true)
		}

		return attack
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			if (!this.ignoreEffectCard.get(instance)) return
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return

			// All attacks from our side should ignore opponent attached effect card this turn
			attack.shouldIgnoreSlots.push(slot.every(slot.opponent, slot.attachSlot, slot.activeRow))
		})

		player.hooks.onTurnEnd.add(instance, () => {
			// Remove ignore flag
			this.ignoreEffectCard.set(instance, false)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		// Remove hooks
		this.ignoreEffectCard.clear(instance)
		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default XBCraftedRareHermitCard
