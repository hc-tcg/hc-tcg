import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {CardInstance} from '../../../types/game-state'
import {discardCard} from '../../../utils/movement'
import Card, {Hermit, hermit} from '../../base/card'

class DungeonTangoRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'dungeontango_rare',
		numericId: 208,
		name: 'DM tango',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'miner',
		health: 280,
		primary: {
			name: 'Lackey',
			cost: ['any'],
			damage: 40,
			power:
				'Discard 1 attached item card. If you have one, draw a random hermit card from your deck.',
		},
		secondary: {
			name: 'Ravager',
			cost: ['miner', 'miner', 'any'],
			damage: 90,
			power: null,
		},
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'primary') return

			let i: number = 0
			do {
				if (player.pile[i].props.id) {
					break
				}
				i++
			} while (i < player.pile.length)

			if (i == player.pile.length) return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Choose an item card to discard',
				canPick: slot.every(slot.player, slot.itemSlot, slot.activeRow, slot.not(slot.empty)),
				onResult(pickedSlot) {
					if (!pickedSlot.card) return

					discardCard(game, pickedSlot.card)

					player.hand.push(player.pile.splice(i, 1)[0])
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default DungeonTangoRareHermitCard
