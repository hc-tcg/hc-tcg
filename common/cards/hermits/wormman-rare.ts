import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {afterAttack, onTurnEnd} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

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
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				game.removeBlockedActions('game', 'PLAY_HERMIT_CARD')

				const newObserver = game.components.new(
					ObserverComponent,
					component.entity,
				)

				newObserver.subscribe(player.hooks.onAttach, (attachedComponent) => {
					game.addBlockedActions('game', 'PLAY_HERMIT_CARD')
					newObserver.unsubscribeFromEverything()
					if (!component.slot.onBoard()) return

					attachedComponent.turnedOver = true

					newObserver.subscribe(
						attachedComponent.player.hooks.onActiveRowChange,
						(_oldActiveHermit, newActiveHermit) => {
							if (newActiveHermit.entity !== attachedComponent.entity) return
							attachedComponent.turnedOver = false
							newObserver.unsubscribeFromEverything()
						},
					)

					newObserver.subscribe(player.hooks.onDetach, (instance) => {
						if (instance.entity !== component.entity) return
						attachedComponent.turnedOver = false
						newObserver.unsubscribeFromEverything()
					})
				})

				newObserver.subscribeWithPriority(
					player.hooks.onTurnEnd,
					onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
					() => newObserver.unsubscribeFromEverything(),
				)

				newObserver.subscribe(player.hooks.getAttack, () => {
					newObserver.unsubscribeFromEverything()
					return null
				})
			},
		)
	},
}

export default WormManRare
