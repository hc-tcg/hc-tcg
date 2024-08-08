import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const LightningRod: Attach = {
	...attach,
	id: 'lightning_rod',
	numericId: 121,
	name: 'Lightning Rod',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	description:
		"All damage done to your Hermits on your opponent's turn is taken by the Hermit this card is attached to.\nDiscard after use. Only one of these cards can be attached to your Hermits at a time.",
	attachCondition: (game, pos) =>
		query.every(
			attach.attachCondition,
			query.not(
				query.exists(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.attach,
					query.slot.has(LightningRod),
				),
			),
		)(game, pos),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let used = false

		observer.subscribe(opponentPlayer.hooks.beforeAttack, (attack) => {
			if (!component.slot?.onBoard() || !component.slot.row) return
			if (attack.type === 'status-effect' || attack.isBacklash) return
			if (game.currentPlayer.entity !== opponentPlayer.entity) return
			if (attack.target?.player.entity !== player.entity) return

			attack.redirect(component.entity, component.slot.row?.entity)
			used = true
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			if (!used) return
			component.discard()
		})
	},
}

export default LightningRod
