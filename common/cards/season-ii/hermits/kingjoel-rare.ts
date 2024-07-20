import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import {flipCoin} from '../../../utils/coinFlips'

class KingJoelRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'king_joel_rare',
		numericId: 163,
		name: 'King Joel',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		type: 'builder',
		health: 280,
		primary: {
			name: 'Diss Track',
			cost: ['builder'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Steal',
			cost: ['builder', 'builder'],
			damage: 80,
			power:
				"Flip a coin. If heads, choose an item card attached to one of your opponent's AFK hermits to attach to one of your AFK Hermits.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const result = flipCoin(player, component)[0]
			if (!result) return

			const firstPickCondition = query.every(
				query.slot.opponent,
				query.slot.item,
				query.not(query.slot.empty),
				query.not(query.slot.active),
				query.not(query.slot.frozen)
			)
			const secondPickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.item,
				query.slot.empty,
				query.slot.row(query.row.hasHermit),
				query.not(query.slot.active),
				query.not(query.slot.frozen)
			)

			let itemSlot: SlotComponent | null = null

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Pick an item card attached to one of your opponent's afk Hermits",
				canPick: firstPickCondition,
				onResult(pickedSlot) {
					itemSlot = pickedSlot
				},
			})

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick an empty item slot on one of your AFK Hermits',
				canPick: secondPickCondition,
				onResult(pickedSlot) {
					// Move the item
					game.swapSlots(itemSlot, pickedSlot)
				},
			})
		})
	}
}

export default KingJoelRare
