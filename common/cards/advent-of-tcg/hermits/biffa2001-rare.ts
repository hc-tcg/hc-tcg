import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import MuseumCollectionEffect from '../../../status-effects/museum-collection'
import {afterApply, beforeAttack, onTurnEnd} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit, SingleUse} from '../../types'

const Biffa2001Rare: Hermit = {
	...hermit,
	id: 'biffa2001_rare',
	numericId: 206,
	name: 'Biffa',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 3,
	type: 'miner',
	health: 290,
	primary: {
		name: 'O.H.O',
		cost: ['miner'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: "Biffa's Museum",
		cost: ['miner', 'any'],
		damage: 70,
		power:
			'For each card you played or used this turn, this attack does 20 more damage.',
	},

	onCreate(game: GameModel, component: CardComponent) {
		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			let museumEffect: StatusEffectComponent | null = null

			newObserver.subscribe(player.hooks.onTurnStart, () => {
				// Only display status effect if Biffa is on the board
				if (
					game.components.exists(
						CardComponent,
						query.card.is(Biffa2001Rare),
						query.card.slot(query.slot.hermit),
					)
				) {
					museumEffect = game.components.new(
						StatusEffectComponent,
						MuseumCollectionEffect,
						component.entity,
					)
					museumEffect.counter = 0
					museumEffect.apply(player.entity)
				}
			})

			newObserver.subscribe(player.hooks.onAttach, (cardInstance) => {
				if (cardInstance.slot.type === 'single_use') return
				if (museumEffect === null) {
					// Create display status effect if first Biffa is placed on board
					if (!query.card.is(Biffa2001Rare)(game, cardInstance)) return
					museumEffect = game.components.new(
						StatusEffectComponent,
						MuseumCollectionEffect,
						component.entity,
					)
					museumEffect.apply(player.entity)
				}
				museumEffect.counter = game.state.turn.cardsPlayed
			})

			newObserver.subscribeWithPriority(
				player.hooks.afterApply,
				afterApply.CHECK_BOARD_STATE,
				() => {
					if (museumEffect) museumEffect.counter = game.state.turn.cardsPlayed
				},
			)

			newObserver.subscribeWithPriority(
				player.hooks.onTurnEnd,
				onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
				() => {
					if (museumEffect) {
						museumEffect.remove()
						museumEffect = null
					}
				},
			)
		})
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				let counter = game.state.turn.cardsPlayed

				if (
					!player.singleUseCardUsed &&
					game.components.find(
						CardComponent<SingleUse>,
						query.card.slot(query.slot.singleUse),
						query.card.isSingleUse,
					)?.props.showConfirmationModal === false
				) {
					counter = counter + 1
				}

				attack.addDamage(component.entity, 20 * counter)
			},
		)
	},
}

export default Biffa2001Rare
