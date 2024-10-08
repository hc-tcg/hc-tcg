import CardOld from '../../base/card'
import {CardComponent} from '../../components'
import {slot} from '../../components/query'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {hermit} from '../defaults'
import {Hermit} from '../types'

class OrionSoundRare extends CardOld {
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

	public override onAttach(game: GameModel, component: CardComponent): void {
		const {player, opponentPlayer} = pos

		let cardsWithStatusEffects: Array<string> = []

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'primary'
			)
				return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Choose an Active or AFK Hermit to heal.',
				canPick: slot.every(slot.not(slot.empty), slot.hermit),
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

					applyStatusEffect(game, 'melody', pickedSlot.cardId)
					cardsWithStatusEffects.push(pickedSlot.cardId.component)
				},
			})
		})

		const afterAttack = (attack: AttackModel) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget || attackTarget.row.health > 0) return
			if (
				attackTarget.player !== pos.player ||
				attackTarget.rowIndex !== pos.rowIndex
			)
				return

			const statusEffectsToRemove = game.state.statusEffects.filterEntities(
				(ail) => {
					return (
						cardsWithStatusEffects.includes(ail.targetInstance.component) &&
						ail.props.id == 'melody'
					)
				},
			)
			statusEffectsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail)
			})
		}

		player.hooks.afterAttack.add(component, (attack) => afterAttack(attack))
		opponentPlayer.hooks.afterAttack.add(component, (attack) =>
			afterAttack(attack),
		)
	}

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player, opponentPlayer} = pos
		const _componentKey = this.getInstanceKey(component)

		player.hooks.onAttack.remove(component)
		player.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.afterAttack.remove(component)
	}
}

export default OrionSoundRare
