import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const IskallmanRare: Hermit = {
	...hermit,
	id: 'iskallman_rare',
	numericId: 580,
	name: 'IskallMAN',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 0,
	type: ['explorer'],
	health: 260,
	primary: {
		name: 'Iskall...MAAAN',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Good Deed',
		cost: ['explorer', 'explorer'],
		damage: 50,
		power:
			'You can choose to remove 50hp from this Hermit and give it to any AFK Hermit on the game board.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component
		let pickedAfkHermit: SlotComponent | null = null

		const pickCondition = query.every(
			query.slot.currentPlayer,
			query.slot.hermit,
			query.not(query.slot.empty),
			query.not(query.slot.active),
		)

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				// Make sure we are attacking
				if (activeInstance.entity !== component.entity) return

				// Only secondary attack
				if (hermitAttackType !== 'secondary') return

				if (
					player.activeRow &&
					player.activeRow.health &&
					player.activeRow.health < 50
				)
					return

				// Make sure there is something to select
				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addModalRequest({
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'IskallMAN - Good Deed',
						description: 'Do you want to give 50hp to an AFK Hermit?',
						cards: [],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
					onResult(modalResult) {
						if (!modalResult) return
						if (!modalResult.result) return
						game.addPickRequest({
							player: player.entity,
							id: component.entity,
							message: 'Pick an AFK Hermit from either side of the board',
							canPick: pickCondition,
							onResult(pickedSlot) {
								pickedAfkHermit = pickedSlot
							},
							onTimeout() {
								// We didn't pick anyone to heal, so heal no one
							},
						})

						return
					},
					onTimeout() {
						return
					},
				})
			},
		)

		// Heals the afk hermit *before* we actually do damage
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (
					!attack.isAttacker(component.entity) ||
					attack.type !== 'secondary' ||
					attack.isBacklash
				)
					return
				if (!pickedAfkHermit?.inRow()) return

				const backlashAttack = game.newAttack({
					attacker: component.entity,
					target: player.activeRowEntity,
					type: 'effect',
					isBacklash: true,
				})

				backlashAttack.addDamage(component.entity, 50)
				backlashAttack.shouldIgnoreCards.push(query.anything)
				attack.addNewAttack(backlashAttack)

				const hermitInfo = pickedAfkHermit.card

				if (hermitInfo) {
					pickedAfkHermit.row.heal(50)
					game.battleLog.addEntry(
						player.entity,
						`$p${component.props.name}$ took $b50hp$ damage, and healed $p${hermitInfo.props.name} (${
							(pickedAfkHermit.row.index || 0) + 1
						})$ by $g50hp$`,
					)
				}
			},
		)
	},
}

export default IskallmanRare
