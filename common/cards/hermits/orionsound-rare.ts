import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applyAilment, getNonEmptyRows, removeAilment} from '../../utils/board'
import HermitCard from '../base/hermit-card'

class OrionSoundRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'orionsound_rare',
			numericId: 155,
			name: 'Ollie',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 260,
			primary: {
				name: 'Melody',
				cost: ['speedrunner'],
				damage: 60,
				power:
					'Select an Active or AFK Hermit. This Hermit is healed by 10hp every turn until Ollie is knocked out.',
			},
			secondary: {
				name: 'Concert',
				cost: ['speedrunner', 'speedrunner'],
				damage: 80,
				power: null,
			},
		})
	}

	public override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)
		player.custom[instanceKey] = []

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return

			game.addPickRequest({
				playerId: player.id,
				id: instance,
				message: 'Choose an Active or AFK Hermit to heal.',
				onResult(pickResult) {
					if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					applyAilment(game, 'melody', pickResult.card.cardInstance)
					player.custom[instanceKey].push(pickResult.card.cardInstance)

					return 'SUCCESS'
				},
			})
		})

		player.hooks.onHermitDeath.add(instance, (hermitPos) => {
			if (hermitPos.rowIndex === null || !hermitPos.row) return
			if (hermitPos.rowIndex !== pos.rowIndex) return

			const ailmentsToRemove = game.state.ailments.filter((ail) => {
				return player.custom[instanceKey].includes(ail.targetInstance) && ail.ailmentId == 'melody'
			})
			ailmentsToRemove.forEach((ail) => {
				removeAilment(game, pos, ail.ailmentInstance)
			})
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.remove(instance)
		delete player.custom[instanceKey]
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}

	override getPalette() {
		return 'advent_of_tcg'
	}

	override getBackground() {
		return 'advent_of_tcg'
	}
}

export default OrionSoundRareHermitCard
