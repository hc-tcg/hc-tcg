import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {SlotComponent} from '../../../types/cards'
import {CardComponent} from '../../../types/game-state'
import Card, {hermit, Hermit} from '../../base/card'

class IskallmanRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'iskallman_rare',
		numericId: 233,
		name: 'IskallMAN',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
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
	}

	override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = pos
		let pickedAfkHermit: SlotComponent | null = null

		const pickCondition = slot.every(
			slot.player,
			slot.hermitSlot,
			slot.not(slot.empty),
			slot.not(slot.activeRow)
		)

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			const activeRow = getActiveRow(player)

			if (!activeRow || activeRow.health < 50) return

			// Make sure there is something to select
			if (!game.someSlotFulfills(pickCondition)) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'IskallMAN: Heal AFK Hermit',
						modalDescription: 'Do you want to give 50hp to an AFK Hermit?',
						cards: [],
						selectionSize: 0,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'
					game.addPickRequest({
						playerId: player.id,
						id: 'iskallman_rare',
						message: 'Pick an AFK Hermit from either side of the board',
						canPick: pickCondition,
						onResult(pickedSlot) {
							if (!pickedSlot.cardId) return
							if (!pickedSlot.rowIndex) return
							pickedAfkHermit = pickedSlot
						},
						onTimeout() {
							// We didn't pick anyone to heal, so heal no one
						},
					})

					return 'SUCCESS'
				},
				onTimeout() {
					return
				},
			})
		})

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary') return
			const activeRow = getActiveRow(player)

			if (!activeRow) return
			if (!pickedAfkHermit) return

			const attacker = attack.getAttacker()
			if (!attacker) return

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(component, 'selfAttack'),
				attacker,
				target: attacker,
				type: 'effect',
				isBacklash: true,
			})
			backlashAttack.addDamage(this.props.id, 50)
			backlashAttack.shouldIgnoreSlots.push(slot.anything)
			attack.addNewAttack(backlashAttack)

			const attackerInfo = attacker.row.hermitCard.card
			const hermitInfo = pickedAfkHermit.rowId?.hermitCard?.card

			if (hermitInfo) {
				healHermit(pickedAfkHermit.rowId, 50)
				game.battleLog.addEntry(
					player.id,
					`$p${attackerInfo.props.name}$ took $b50hp$ damage, and healed $p${
						hermitInfo.props.name
					} (${(pickedAfkHermit.rowIndex || 0) + 1})$ by $g50hp$`
				)
			}
		})
	}

	public override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = pos

		player.hooks.getAttackRequests.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default IskallmanRareHermitCard
