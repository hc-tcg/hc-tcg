import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import {flipCoin} from '../../../utils/coinFlips'

class KingJoelRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'kingjoel_rare',
		numericId: 163,
		name: 'King Joel',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
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
			damage: 90,
			power:
				"Flip a coin. If heads, choose an item card attached to one of your opponent's AFK hermits to attach to one of your AFK Hermits.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		const firstPickCondition = query.every(
			query.slot.opponent,
			query.not(query.slot.active),
			query.slot.item,
			query.not(query.slot.empty)
		)

		const secondPickCondition = query.every(
			query.slot.currentPlayer,
			query.not(query.slot.active),
			query.slot.item,
			query.slot.empty,
			query.slot.row(query.row.hasHermit)
		)

		let fistPickedCard: CardComponent | null = null

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!game.components.exists(SlotComponent, firstPickCondition)) return
			if (!game.components.exists(SlotComponent, secondPickCondition)) return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Pick an item card from your opponent's AFK Hermits",
				canPick: firstPickCondition,
				onResult(pickedSlot) {
					fistPickedCard = pickedSlot.getCard()
				},
			})

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick a slot to place the item card',
				canPick: secondPickCondition,
				onResult(pickedSlot) {
					if (!fistPickedCard) return
					fistPickedCard.attach(pickedSlot)
				},
			})
		})
	}
}

export default KingJoelRare
