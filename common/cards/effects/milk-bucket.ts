import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {TurnActions} from '../../types/game-state'
import EffectCard from '../base/effect-card'
import {CARDS} from '..'
import {applySingleUse, removeAilment} from '../../utils/board'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			numericId: 79,
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Remove poison and bad omen on active or AFK Hermit.\n\nOR can be attached to prevent poison.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, slot, row} = pos
		if (slot.type === 'single_use') {
			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Pick one of your Hermits',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'
					if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					const ailmentsToRemove = game.state.ailments.filter((ail) => {
						return (
							ail.targetInstance === pickResult.card?.cardInstance &&
							(ail.ailmentId == 'poison' || ail.ailmentId == 'badomen')
						)
					})
					ailmentsToRemove.forEach((ail) => {
						removeAilment(game, pos, ail.ailmentInstance)
					})

					applySingleUse(game)

					return 'SUCCESS'
				},
			})
		} else if (slot.type === 'effect') {
			player.hooks.onDefence.add(instance, (attack) => {
				if (!row) return
				const ailmentsToRemove = game.state.ailments.filter((ail) => {
					return (
						ail.targetInstance === row.hermitCard?.cardInstance &&
						(ail.ailmentId == 'poison' || ail.ailmentId == 'badomen')
					)
				})
				ailmentsToRemove.forEach((ail) => {
					removeAilment(game, pos, ail.ailmentInstance)
				})
			})

			opponentPlayer.hooks.afterApply.add(instance, () => {
				if (!row) return
				const ailmentsToRemove = game.state.ailments.filter((ail) => {
					return (
						ail.targetInstance === row.hermitCard?.cardInstance &&
						(ail.ailmentId == 'poison' || ail.ailmentId == 'badomen')
					)
				})
				ailmentsToRemove.forEach((ail) => {
					removeAilment(game, pos, ail.ailmentInstance)
				})
			})
		}
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
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
