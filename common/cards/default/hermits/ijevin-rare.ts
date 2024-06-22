import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import HermitCard from '../../base/hermit-card'

class IJevinRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ijevin_rare',
			numericId: 39,
			name: 'Jevin',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 300,
			primary: {
				name: 'Your Boi',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Peace Out',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power:
					'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.getTarget()) return

			const pickCondition = slot.every(
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.hermitSlot
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: opponentPlayer.id, // For opponent player to pick
				id: this.id,
				message: 'Choose a new active Hermit from your AFK Hermits.',
				canPick: pickCondition,
				onResult(pickResult) {
					if (!pickResult.card || pickResult.rowIndex === null) return

					game.changeActiveRow(opponentPlayer, pickResult.rowIndex)
				},
				onTimeout() {
					const rowIndex = game.filterSlots(pickCondition)[0].rowIndex
					if (rowIndex === null) return
					game.changeActiveRow(opponentPlayer, rowIndex)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.remove(instance)
	}
}

export default IJevinRareHermitCard
