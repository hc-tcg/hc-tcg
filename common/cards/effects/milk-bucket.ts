import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import EffectCard from '../base/effect-card'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Remove poison and bad omen on active or AFK Hermit.\n\nOR can be attached to prevent poison.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', slot: ['hermit'], amount: 1}],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos
		if (slot.type === 'single_use') {
			player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
				const pickedCards = pickedSlots[this.id] || []
				if (pickedCards.length !== 1) return
				const targetSlot = pickedCards[0]
				if (!targetSlot.row || !targetSlot.row.state.hermitCard) return

				targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter(
					(a) => a.id !== 'poison' && a.id !== 'badomen'
				)
			})
		} else if (slot.type === 'effect') {
			player.hooks.onDefence.add(instance, (attack, pickedSlots) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
			})

			opponentPlayer.hooks.afterApply.add(instance, (attack, pickedSlots) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
			})
		}
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onApply.remove(instance)
		player.hooks.onDefence.remove(instance)
		opponentPlayer.hooks.afterApply.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (!['single_use', 'effect'].includes(pos.slot.type)) return 'INVALID'
		if (!pos.row?.hermitCard && pos.slot.type === 'effect') return 'NO'

		return 'YES'
	}

	override showSingleUseTooltip(): boolean {
		return true
	}
}

export default MilkBucketEffectCard
