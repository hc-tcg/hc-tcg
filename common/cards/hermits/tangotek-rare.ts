import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const TangoTekRare: Hermit = {
	...hermit,
	id: 'tangotek_rare',
	numericId: 95,
	name: 'Tango',
	expansion: 'default',
	rarity: 'rare',
	tokens: 1,
	type: 'farm',
	health: 290,
	primary: {
		name: 'Skadoodle',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Extra Flee',
		cost: ['farm', 'farm', 'farm'],
		damage: 100,
		power:
			'After your attack, both players must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.\nYour opponent chooses their active Hermit first.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const opponentInactiveRowsPickCondition = query.every(
					query.slot.opponent,
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.slot.canBecomeActive,
				)
				const playerInactiveRowsPickCondition = query.every(
					query.slot.currentPlayer,
					query.slot.hermit,
					query.not(query.slot.active),
					query.not(query.slot.empty),
					query.slot.canBecomeActive,
				)

				// Check if we are blocked from changing by anything other than the game
				const canChange = !game.isActionBlocked('CHANGE_ACTIVE_HERMIT', [
					'game',
				])

				// If opponent has hermit they can switch to, add a pick request for them to switch
				if (
					game.components.exists(
						SlotComponent,
						opponentInactiveRowsPickCondition,
					)
				) {
					game.addPickRequest({
						player: opponentPlayer.entity,
						id: component.entity,
						message: 'Pick a new active Hermit from your afk hermits',
						canPick: opponentInactiveRowsPickCondition,
						onResult(pickedSlot) {
							if (!pickedSlot.inRow()) return
							opponentPlayer.changeActiveRow(pickedSlot.row)
						},
						onTimeout() {
							let newActiveRow = game.components.find(
								SlotComponent,
								opponentInactiveRowsPickCondition,
							)
							if (!newActiveRow?.inRow()) return
							opponentPlayer.changeActiveRow(newActiveRow.row)
						},
					})
				}

				// If we have an afk hermit, didn't just die, and are not bound in place, add a pick for us to switch
				if (
					game.components.exists(
						SlotComponent,
						playerInactiveRowsPickCondition,
					) &&
					component.slot.inRow() &&
					component.slot.row.health &&
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
			},
		)
	},
}

export default TangoTekRare
