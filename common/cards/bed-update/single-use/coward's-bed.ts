import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const hasSwitchable = query.every(
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
	query.slot.canBecomeActive,
)

const CowardsBed: SingleUse = {
	...singleUse,
	id: "coward's_bed",
	numericId: 264,
	name: "Coward's Bed",
	expansion: 'beds',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		'Both players must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.\nYour opponent chooses their active Hermit first.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, hasSwitchable),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			//Copied from Tango Rare, slightly modified.
			const playerInactiveRowsPickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.hermit,
				query.not(query.slot.active),
				query.not(query.slot.empty),
				query.slot.canBecomeActive,
			)

			// Check if we are blocked from changing by anything other than the game
			const canChange = !game.isActionBlocked('CHANGE_ACTIVE_HERMIT', ['game'])

			// If opponent has hermit they can switch to, add a pick request for them to switch
			let knockbackPickRequest =
				opponentPlayer.getKnockbackPickRequest(component)
			if (knockbackPickRequest) game.addPickRequest(knockbackPickRequest)

			// If we have an afk hermit and are not bound in place, add a pick for us to switch
			if (
				game.components.exists(
					SlotComponent,
					playerInactiveRowsPickCondition,
				) &&
				canChange
			) {
				game.addPickRequest({
					player: player.entity,
					id: component.entity,
					message: 'Pick a new active Hermit from your afk hermits',
					canPick: playerInactiveRowsPickCondition,
					onResult(pickedSlot) {
						if (!pickedSlot.inRow()) return
						player.changeActiveRow(pickedSlot.row)
					},
					onTimeout() {
						let newActiveHermit = game.components.find(
							SlotComponent,
							playerInactiveRowsPickCondition,
						)
						if (!newActiveHermit?.inRow()) return
						player.changeActiveRow(newActiveHermit.row)
					},
				})
			}
		})
	},
}

export default CowardsBed
