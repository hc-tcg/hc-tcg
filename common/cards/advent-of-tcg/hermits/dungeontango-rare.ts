import {CardComponent} from '../../components'
import {slot} from '../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class DungeonTangoRare extends CardOld {
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

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
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
				player: player.entity,
				id: this.props.id,
				message: 'Choose an item card to discard',
				canPick: slot.every(
					slot.player,
					slot.item,
					slot.active,
					slot.not(slot.empty),
				),
				onResult(pickedSlot) {
					if (!pickedSlot.cardId) return

					discardCard(game, pickedSlot.cardId)

					player.hand.push(player.pile.splice(i, 1)[0])
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default DungeonTangoRare
