import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {TurnActions} from '../../types/game-state'
import EffectCard from '../base/effect-card'
import {CARDS} from '..'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			numericId: 79,
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
			player.hooks.onApply.add(instance, (pickedSlots) => {
				const pickedCards = pickedSlots[this.id] || []
				if (pickedCards.length !== 1) return
				const targetSlot = pickedCards[0]
				if (!targetSlot.row || !targetSlot.row.state.hermitCard) return

				targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter(
					(a) => a.id !== 'poison' && a.id !== 'badomen'
				)
			})
		} else if (slot.type === 'effect') {
			player.hooks.onDefence.add(instance, (attack) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
			})

			opponentPlayer.hooks.afterApply.add(instance, (attack) => {
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
		const {currentPlayer} = game

		if (!['single_use', 'effect'].includes(pos.slot.type)) return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'
		if (pos.slot.type === 'effect') {
			if (!pos.row?.hermitCard) return 'INVALID'
			const cardInfo = CARDS[pos.row.hermitCard?.cardId]
			if (!cardInfo) return 'INVALID'
			if (!cardInfo.canAttachToCard(game, pos)) return 'NO'
		}

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

export default MilkBucketEffectCard
