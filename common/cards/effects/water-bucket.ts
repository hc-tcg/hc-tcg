import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {TurnActions} from '../../types/game-state'
import {discardCard} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class WaterBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'water_bucket',
			name: 'Water Bucket',
			rarity: 'common',
			description:
				'Remove burn and String on active or AFK Hermit.\n\nOR can be attached to prevent burn.',
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
				targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter((a) => a.id !== 'fire')

				if (targetSlot.row.state.effectCard?.cardId === 'string') {
					discardCard(game, targetSlot.row.state.effectCard)
				}
				for (let i = 0; i < targetSlot.row.state.itemCards.length; i++) {
					if (targetSlot.row.state.itemCards[i]?.cardId === 'string') {
						discardCard(game, targetSlot.row.state.itemCards[i])
					}
				}
			})
		} else if (slot.type === 'effect') {
			player.hooks.onDefence.add(instance, (attack) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
			})

			opponentPlayer.hooks.afterApply.add(instance, (pickedSlots, modalResult) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
			})
		}
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onApply.remove(instance)
		opponentPlayer.hooks.afterApply.remove(instance)
		player.hooks.onDefence.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		if (!['single_use', 'effect'].includes(pos.slot.type)) return 'INVALID'
		if (!pos.row?.hermitCard && pos.slot.type === 'effect') return 'NO'

		return 'YES'
	}

	// Allows placing in effect or single use slot
	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there is a hermit on the board with space for an effect card
		const spaceForEffect = currentPlayer.board.rows.some((row) => {
			return !!row.hermitCard && !row.effectCard
		})
		const hasHermit = currentPlayer.board.rows.some((row) => !!row.hermitCard)
		const spaceForSingleUse = !game.currentPlayer.board.singleUseCard

		const actions: TurnActions = []
		if (spaceForEffect) actions.push('PLAY_EFFECT_CARD')
		if (hasHermit && spaceForSingleUse) actions.push('PLAY_SINGLE_USE_CARD')
		return actions
	}

	override showSingleUseTooltip(): boolean {
		return true
	}
}

export default WaterBucketEffectCard
