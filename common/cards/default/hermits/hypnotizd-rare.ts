import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {PickRequest} from '../../../types/server-requests'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import BetrayedEffect from '../../../status-effects/betrayed'
import {AttackModel} from '../../../models/attack-model'
import {HermitAttackType} from '../../../types/attack'

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'hypnotizd_rare',
		numericId: 37,
		name: 'Hypno',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'miner',
		health: 270,
		primary: {
			name: 'MmHmm',
			cost: ['miner'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: "Got 'Em",
			cost: ['miner', 'any'],
			damage: 70,
			power:
				"You can choose to attack one of your opponent's AFK Hermits. If you do this, you must discard one item card attached to your active Hermit.",
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player, opponentPlayer} = component
		let target: SlotComponent | null = null

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!target?.inRow()) return
			attack.setTarget(component.entity, target.row.entity)
			target = null
		})

		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			if (activeInstance.entity !== component.entity || hermitAttackType !== 'secondary') return

			const pickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.active,
				query.slot.item,
				query.not(query.slot.empty)
			)

			// Betrayed ignores the slot that you pick in this pick request, so we skip this pick request
			// to make the game easier to follow.
			if (player.hasStatusEffect(BetrayedEffect)) return

			if (!game.components.exists(SlotComponent, pickCondition)) return

			const itemRequest: PickRequest = {
				playerId: player.id,
				id: component.entity,
				message: 'Choose an item to discard from your active Hermit.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					pickedSlot.getCard()?.discard()
				},
				onTimeout() {
					game.components.find(SlotComponent, pickCondition)?.getCard()?.discard()
				},
			}

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Pick one of your opponent's Hermits",
				canPick: query.every(query.slot.opponent, query.slot.hermit, query.not(query.slot.empty)),
				onResult: (pickedSlot) => {
					if (!pickedSlot.inRow()) return
					const targetingAfk = pickedSlot.rowEntity !== opponentPlayer.activeRowEntity

					// Store the row index to use later
					target = pickedSlot

					if (targetingAfk) {
						// Add a second pick request to remove an item
						game.addPickRequest(itemRequest)
					}
				},
			})
		})
	}
}

export default HypnotizdRare
