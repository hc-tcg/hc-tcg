import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

class IJevinRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'ijevin_rare',
		numericId: 39,
		name: 'Jevin',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
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
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
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
				id: this.props.id,
				message: 'Choose a new active Hermit from your AFK Hermits.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.cardId || pickedSlot.row === null) return
					game.changeActiveRow(opponentPlayer, pickedSlot.row)
				},
				onTimeout() {
					const row = game.state.slots.filter(pickCondition)[0].row
					if (!row) return
					game.changeActiveRow(opponentPlayer, row)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.remove(instance)
	}
}

export default IJevinRareHermitCard
