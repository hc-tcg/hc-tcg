import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {CardComponent, SlotComponent} from '../../../components'
import {query, slot} from '../../../components/query'
import Card, {InstancedValue} from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import ArmorStand from '../../alter-egos/effects/armor-stand'
import {setupMockedCard} from '../../../utils/attacks'

class RendogRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'rendog_rare',
		numericId: 87,
		name: 'Rendog',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
		health: 250,
		primary: {
			name: "Comin' At Ya",
			cost: ['builder'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Role Play',
			cost: ['builder', 'builder', 'builder'],
			damage: 0,
			power: "Use an attack from any of your opponent's Hermits.",
		},
	}

	pickCondition = query.every(
		slot.opponent,
		slot.hermitSlot,
		query.not(slot.empty),
		query.not(slot.has(RendogRare)),
		query.not(slot.has(ArmorStand))
	)

	imitatingCard = new InstancedValue<CardComponent | null>(() => null)
	pickedAttack = new InstancedValue<HermitAttackType | null>(() => null)

	override getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType
	) {
		if (hermitAttackType !== 'secondary') return super.getAttack(game, component, hermitAttackType)

		const imitatingCard = this.imitatingCard.get(component)
		const pickedAttack = this.pickedAttack.get(component)

		if (!imitatingCard?.isHermit()) return null
		if (!pickedAttack) return null

		let newAttack = imitatingCard.card.getAttack(game, imitatingCard, pickedAttack)

		if (!newAttack) return null

		const attackName =
			newAttack.type === 'primary'
				? imitatingCard.props.primary.name
				: imitatingCard.props.secondary.name
		newAttack.updateLog(
			(values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with $v${imitatingCard?.props.name}'s ${attackName}$ for ${values.damage} damage`
		)
		return newAttack
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return
			// Only activate power on secondary attack
			if (hermitAttackType !== 'secondary') return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Pick one of your opponent's Hermits",
				canPick: this.pickCondition,
				onResult: (pickedSlot) => {
					let pickedCard = pickedSlot.getCard()
					if (!pickedCard) return

					game.addModalRequest({
						playerId: player.id,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Rendog: Choose an attack to copy',
								modalDescription: "Which of the Hermit's attacks do you want to copy?",
								hermitCard: pickedCard.toLocalCardInstance(),
							},
						},
						onResult: (modalResult) => {
							if (!modalResult) return 'FAILURE_INVALID_DATA'
							if (modalResult.cancel) {
								// Cancel this attack so player can choose a different hermit to imitate
								game.state.turn.currentAttack = null
								game.cancelPickRequests()
								return 'SUCCESS'
							}

							// Store the chosen attack to copy
							this.pickedAttack.set(component, modalResult.pick)
							if (pickedCard?.isHermit())
								this.imitatingCard.set(
									component,
									setupMockedCard(game, modalResult.pick, pickedCard, component)
								)

							return 'SUCCESS'
						},
						onTimeout: () => {
							this.imitatingCard.set(component, pickedCard)
							this.pickedAttack.set(component, 'primary')
						},
					})
				},
				onTimeout() {
					// We didn't pick someone to imitate so do nothing
				},
			})
		})

		player.hooks.blockedActions.add(component, (blockedActions) => {
			// Block "Role Play" if there are not opposing Hermit cards other than rare Ren(s)
			if (!game.components.exists(SlotComponent, this.pickCondition))
				blockedActions.push('SECONDARY_ATTACK')
			return blockedActions
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		// Remove hooks and custom data
		this.imitatingCard.clear(component)
		this.pickedAttack.clear(component)
		player.hooks.getAttackRequests.remove(component)
		player.hooks.onActiveRowChange.remove(component)
		player.hooks.blockedActions.remove(component)
	}
}

export default RendogRare
