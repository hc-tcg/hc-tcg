import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class MonkeyfarmRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'monkeyfarm_rare',
		numericId: 212,
		name: 'Monkeyfarm',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'farm',
		health: 250,
		primary: {
			name: 'Skull',
			cost: ['farm'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Monkeystep',
			cost: ['farm', 'farm'],
			damage: 80,
			power:
				"Flip a coin. If heads, discard 1 attached item card from an opponent's AFK Hermit.",
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const pickCondition = query.every(
				query.slot.opponent,
				query.slot.item,
				query.not(query.slot.active),
				query.not(query.slot.empty),
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] !== 'heads') return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Pick one of your opponent's AFK Hermit's item cards",
				canPick: pickCondition,
				onResult(pickedSlot) {
					pickedSlot.getCard()?.discard()
				},
			})
		})
	}
}

export default MonkeyfarmRare
