import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {executeExtraAttacks} from '../../../utils/attacks'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const PoePoeSkizzRare: Hermit = {
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
			'After your attack, you can choose to move your active Hermit and any attached cards to any open row on the game board, then do an additional 20hp damage to the Hermit directly opposite your active Hermit.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!component.slot.inRow()) return
				if (query.slot.frozen(game, component.slot)) return

				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick an empty Hermit slot or your active Hermit.',
					canPick: query.every(
						query.slot.hermit,
						query.slot.currentPlayer,
						query.some(
							query.slot.empty,
							query.slot.rowIs(component.slot.rowEntity),
						),
					),
					onResult(pickedSlot) {
						if (!pickedSlot.inRow() || !component.slot.inRow()) return
						if (pickedSlot.row.entity === component.slot.rowEntity) return

						game.swapRows(pickedSlot.row, component.slot.row)

						const jumpscareTarget = game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							game.components.filter(RowComponent, query.row.opponentPlayer)
								.length > 1
								? query.row.index(component.slot.row.index)
								: query.anything, // Lets Jumpscare always damage opponent, if opponent only has a single row and player can move
						)

						if (!jumpscareTarget || !jumpscareTarget.getHermit()) return

						const jumpscareAttack = game.newAttack({
							attacker: component.entity,
							target: jumpscareTarget.entity,
							type: 'secondary',
							log: (values) =>
								` and dealt ${values.damage} to ${values.target}`,
						})
						jumpscareAttack.addDamage(component.entity, 20)
						jumpscareAttack.shouldIgnoreCards.push(
							query.card.entity(component.entity),
						)
						executeExtraAttacks(game, [jumpscareAttack])
					},
				})
			},
		)
	},
}

export default PoePoeSkizzRare
