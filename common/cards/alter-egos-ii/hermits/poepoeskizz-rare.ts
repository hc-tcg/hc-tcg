import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'

class PoePoeSkizzRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'poepoeskizz_rare',
		numericId: 166,
		name: 'Poe Poe Skizz',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'pvp',
		health: 250,
		primary: {
			name: 'Teardown',
			cost: ['pvp'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Jump Scare',
			cost: ['pvp', 'pvp', 'any'],
			damage: 90,
			power:
				'After your attack, you can choose move your active Hermit and any attached cards to an open row on your board. Afterwards, deal 20hp damage to the Hermit directly across from your active Hermit.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		const pickCondition = query.every(
			query.some(query.slot.empty, query.slot.active),
			query.slot.hermit,
			query.slot.currentPlayer
		)

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick an empty Hermit slot, or your active Hermit',
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow() || !player.activeRow) return
					game.swapRows(player.activeRow, pickedSlot.row)

					const oppositeRow = game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(player.activeRow.index)
					)

					const attack = game
						.newAttack({
							attacker: component.entity,
							target: oppositeRow?.entity,
							type: 'effect',
							isBacklash: true,
						})
						.addDamage(this.id, 20)

					executeExtraAttacks(game, [attack], true)
				},
			})
		})
	}
}

export default PoePoeSkizzRare
