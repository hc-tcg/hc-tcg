import {CardComponent, ObserverComponent} from '../../../components'
import {ObserverEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import {afterAttack, onTurnEnd} from '../../../types/priorities'
import {InstancedValue} from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const observers = new InstancedValue<Array<ObserverEntity>>(() => [])

const WormManRare: Hermit = {
	...hermit,
	id: 'wormman_rare',
	numericId: 175,
	name: 'Worm Man',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: 'prankster',
	health: 260,
	primary: {
		name: 'Side Kick',
		cost: ['prankster'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Total Anonymity',
		shortName: 'T. Anonymity',
		cost: ['prankster', 'prankster', 'any'],
		damage: 90,
		power:
			'At the end of your turn, you can choose to take a Hermit card from your hand and place it face down on an AFK slot. This card must be revealed when either player interacts with the card, or when this Worm Man is knocked out.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				game.removeBlockedActions('game', 'PLAY_HERMIT_CARD')

				observer.subscribe(player.hooks.onAttach, (attachedComponent) => {
					game.addBlockedActions(this.id, 'PLAY_HERMIT_CARD')
					attachedComponent.turnedOver = true

					const newObserver = game.components.new(
						ObserverComponent,
						attachedComponent.entity,
					)
					observers.set(component, [
						...observers.get(component),
						newObserver.entity,
					])

					newObserver.subscribe(
						player.hooks.onActiveRowChange,
						(_oldActiveHermit, newActiveHermit) => {
							if (newActiveHermit.entity !== attachedComponent.entity) return
							attachedComponent.turnedOver = false
							newObserver.unsubscribe(player.hooks.freezeSlots)
						},
					)

					observer.unsubscribe(player.hooks.onAttach)
				})
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				observer.unsubscribe(player.hooks.onAttach)
			},
		)
	},
	onDetach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	): void {
		const {player} = component

		observers.get(component).forEach((observerEntity) => {
			const observer = game.components.get(observerEntity)
			if (!observer) return
			observer.unsubscribe(player.hooks.onActiveRowChange)

			const attachedCard = game.components.get(observer.wrappingEntity)
			if (!attachedCard || !(attachedCard instanceof CardComponent)) return
			attachedCard.turnedOver = false
		})
	},
}

export default WormManRare
