import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class KingJoelRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'kingjoel_rare',
		numericId: 163,
		name: 'King Joel',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
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
				"Flip a coin.\nIf heads, choose an item card attached to one of your opponent's AFK Hermits and attach it to one of your AFK Hermits.",
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const firstPickCondition = query.every(
			query.slot.opponent,
			query.not(query.slot.active),
			query.slot.item,
			query.not(query.slot.empty),
		)

		const secondPickCondition = query.every(
			query.slot.currentPlayer,
			query.not(query.slot.active),
			query.slot.item,
			query.slot.empty,
			query.slot.row(query.row.hasHermit),
		)

		let fistPickedCard: CardComponent | null = null

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return
			if (!game.components.exists(SlotComponent, firstPickCondition)) return
			if (!game.components.exists(SlotComponent, secondPickCondition)) return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: "Pick an item card from your opponent's AFK Hermits",
				canPick: firstPickCondition,
				onResult(pickedSlot) {
					fistPickedCard = pickedSlot.getCard()
				},
			})

			game.addPickRequest({
				player: player.entity,
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
