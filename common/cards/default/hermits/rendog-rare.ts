import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import * as query from '../../../components/query'
import Card, {InstancedValue} from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import ArmorStand from '../../alter-egos/effects/armor-stand'

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
		query.slot.opponent,
		query.slot.hermitSlot,
		query.not(query.slot.empty),
		query.not(query.slot.has(RendogRare)),
		query.not(query.slot.has(ArmorStand))
	)

	imitatingCard = new InstancedValue<Card<Hermit> | null>(() => null)
	imitatingObserver = new InstancedValue<ObserverComponent | null>(() => null)
	pickedAttack = new InstancedValue<HermitAttackType | null>(() => null)

	override getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType
	) {
		if (hermitAttackType !== 'secondary') return super.getAttack(game, component, hermitAttackType)

		const imitatingCard = this.imitatingCard.get(component)
		const imitatingObserver = this.imitatingObserver.get(component)
		const pickedAttack = this.pickedAttack.get(component)

		if (!imitatingCard?.isHermit()) return null
		if (!imitatingObserver) return null
		if (!pickedAttack) return null

		let newAttack = imitatingCard.getAttack(game, component, pickedAttack)

		imitatingObserver.subscribe(component.player.hooks.afterAttack, () => {
			imitatingCard.onDetach(game, component, imitatingObserver)
			imitatingObserver.unsubscribeFromEverything()
		})

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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.getAttackRequests, (activeInstance, hermitAttackType) => {
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
							let observer = game.components.new(ObserverComponent, component.entity)
							this.pickedAttack.set(component, modalResult.pick)
							this.imitatingObserver.set(component, observer)
							pickedCard?.card.onAttach(game, component, observer)
							if (pickedCard?.isHermit()) this.imitatingCard.set(component, pickedCard.card)

							return 'SUCCESS'
						},
						onTimeout: () => {
							if (!pickedCard) return
							let observer = game.components.new(ObserverComponent, component.entity)
							this.imitatingCard.set(component, pickedCard.card as Card<Hermit>)
							this.imitatingObserver.set(component, observer)
							pickedCard.card.onAttach(game, component, observer)
							this.pickedAttack.set(component, 'primary')
						},
					})
				},
				onTimeout() {
					// We didn't pick someone to imitate so do nothing
				},
			})
		})

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			// Block "Role Play" if there are not opposing Hermit cards other than rare Ren(s)
			if (!game.components.exists(SlotComponent, this.pickCondition))
				blockedActions.push('SECONDARY_ATTACK')
			return blockedActions
		})
	}

	override onDetach(_game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		this.imitatingCard.clear(component)
		this.pickedAttack.clear(component)
	}
}

export default RendogRare
