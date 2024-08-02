import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {HermitAttackType} from '../../../types/attack'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import Card, {InstancedValue} from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import ArmorStand from '../../alter-egos/effects/armor-stand'
import {MockedAttack, setupMockCard} from '../../../utils/attacks'

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
		query.slot.currentPlayer,
		query.slot.hermit,
		query.not(query.slot.empty),
		query.not(query.slot.active),
		query.not(query.slot.has(ArmorStand))
	)

	mockedAttacks = new InstancedValue<MockedAttack | null>(() => null)

	override getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType
	) {
		if (hermitAttackType !== 'secondary') return super.getAttack(game, component, hermitAttackType)

		const mockedAttack = this.mockedAttacks.get(component)
		if (!mockedAttack) return null

		let newAttack = mockedAttack.getAttack()
		if (!newAttack) return null

		const attackName = mockedAttack.attackName
		newAttack.updateLog(
			(values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with $v${mockedAttack.hermitName}'s ${attackName}$ for ${values.damage} damage`
		)
		return newAttack
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance.entity !== component.entity) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure we have an afk hermit to pick
			if (!game.components.exists(SlotComponent, this.pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick one of your AFK Hermits',
				canPick: this.pickCondition,
				onResult: (pickedSlot) => {
					const pickedCard = pickedSlot.getCard() as CardComponent<Hermit> | null
					if (!pickedCard) return

					game.addModalRequest({
						player: player.entity,
						data: {
							modalId: 'copyAttack',
							payload: {
								modalName: 'Cleo: Choose an attack to copy',
								modalDescription: "Which of the Hermit's attacks do you want to copy?",
								hermitCard: pickedCard.entity,
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
							this.mockedAttacks.set(
								component,
								setupMockCard(game, component, pickedCard, modalResult.pick)
							)

							return 'SUCCESS'
						},
						onTimeout: () => {
							this.mockedAttacks.set(
								component,
								setupMockCard(game, component, pickedCard, 'primary')
							)
						},
					})
				},
				onTimeout() {
					// We didn't pick someone so do nothing
				},
			})
		})

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			if (!game.components.exists(SlotComponent, this.pickCondition)) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		})
	}

	override onDetach(_game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		this.mockedAttacks.clear(component)
	}
}

export default ZombieCleoRare
