import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {HermitAttackType} from '../../../types/attack'
import {CardComponent, SlotComponent} from '../../../components'
import Card, {InstancedValue} from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import {setupMockedCard} from '../../../utils/attacks'
import ArmorStand from '../../alter-egos/effects/armor-stand'

class ZombieCleoRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'zombiecleo_rare',
		numericId: 116,
		name: 'Cleo',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'pvp',
		health: 290,
		primary: {
			name: 'Dismissed',
			cost: ['pvp'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Puppetry',
			cost: ['pvp', 'pvp', 'pvp'],
			damage: 0,
			power: 'Use an attack from any of your AFK Hermits.',
		},
	}

	pickCondition = query.every(
		slot.currentPlayer,
		slot.hermitSlot,
		query.not(slot.empty),
		query.not(slot.activeRow),
		query.not(slot.has(ZombieCleoRare)),
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

		if (!imitatingCard || !pickedAttack) return null
		if (!imitatingCard.isHermit()) return null

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
				} with $v${imitatingCard.props.name}'s ${attackName}$ for ${values.damage} damage`
		)
		return newAttack
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.getAttackRequests.add(component, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure we have an afk hermit to pick
			if (!game.components.exists(SlotComponent, this.pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick one of your AFK Hermits',
				canPick: this.pickCondition,
				onResult: (pickedSlot) => {
					const pickedCard = pickedSlot.getCard()
					if (!pickedCard) return

					game.addModalRequest({
						playerId: player.id,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Cleo: Choose an attack to copy',
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
							if (!modalResult.pick) return 'FAILURE_INVALID_DATA'

							// Store the card to copy when creating the attack
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
					// We didn't pick someone so do nothing
				},
			})
		})

		player.hooks.blockedActions.add(component, (blockedActions) => {
			if (!game.components.exists(SlotComponent, this.pickCondition)) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		this.pickedAttack.clear(component)
		player.hooks.getAttackRequests.remove(component)
		player.hooks.blockedActions.remove(component)
	}
}

export default ZombieCleoRare
