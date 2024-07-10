import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import {applyStatusEffect, removeStatusEffect} from '../../../utils/board'
import Card, {Hermit, hermit} from '../../base/card'

class OrionSoundRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'orionsound_rare',
		numericId: 213,
		name: 'Oli',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
		health: 280,
		primary: {
			name: 'Melody',
			cost: ['speedrunner'],
			damage: 60,
			power:
				'Select an Active or AFK Hermit. This Hermit is healed by 10hp every turn until Oli is knocked out.',
		},
		secondary: {
			name: 'Concert',
			cost: ['speedrunner', 'speedrunner'],
			damage: 80,
			power: null,
		},
	}

	public override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos

		let cardsWithStatusEffects: Array<string> = []

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return

			game.addPickRequest({
				playerId: player.id,
				id: instance.entity,
				message: 'Choose an Active or AFK Hermit to heal.',
				canPick: slot.every(slot.not(slot.empty), slot.hermitSlot),
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

					applyStatusEffect(game, 'melody', pickedSlot.cardId)
					cardsWithStatusEffects.push(pickedSlot.cardId.instance)
				},
			})
		})

		const afterAttack = (attack: AttackModel) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget || attackTarget.row.health > 0) return
			if (attackTarget.player !== pos.player || attackTarget.rowIndex !== pos.rowIndex) return

			const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
				return (
					cardsWithStatusEffects.includes(ail.targetInstance.instance) && ail.props.id == 'melody'
				)
			})
			statusEffectsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail)
			})
		}

		player.hooks.afterAttack.add(instance, (attack) => afterAttack(attack))
		opponentPlayer.hooks.afterAttack.add(instance, (attack) => afterAttack(attack))
	}

	public override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
	}
}

export default OrionSoundRareHermitCard
