import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import {executeAttacks} from '../../../utils/attacks'

class PoePoeSkizzRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'poepoeskizz_rare',
		numericId: 167,
		name: 'Poe Poe Skizz',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'pvp',
		health: 250,
		primary: {
			name: 'Teardown',
			cost: ['pvp'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Jumpscare',
			cost: ['pvp', 'pvp', 'any'],
			damage: 90,
			power:
				'After using this attack, move to any row on the board, then do an additional 20hp damage to the Hermit directly opposite to you.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick an empty Hermit slot',
				canPick: query.every(query.slot.hermit, query.slot.currentPlayer, query.slot.empty),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow() || !component.slot.inRow()) return

					game.swapRows(pickedSlot.row, component.slot.row)

					const jumpscareTarget = game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(component.slot.row.index)
					)

					if (!jumpscareTarget || !jumpscareTarget.getHermit()) return

					const jumpscareAttack = game.newAttack({
						attacker: component.entity,
						target: jumpscareTarget.entity,
						type: 'secondary',
						log: (values) => ` and dealt ${values.damage} to ${values.target}`,
					})
					jumpscareAttack.addDamage(component.entity, 20)
					jumpscareAttack.shouldIgnoreCards.push(query.card.entity(component.entity))
					executeAttacks(game, [jumpscareAttack])
				},
			})
		})
	}
}

export default PoePoeSkizzRare
