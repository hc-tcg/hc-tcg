import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {PlayerEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import {GameValue} from '../../../models/game-value'
import MuseumCollectionEffect from '../../../status-effects/museum-collection'
import {beforeAttack, onTurnEnd} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit, SingleUse} from '../../types'

const cardsPlayed = new GameValue<Record<PlayerEntity, number | undefined>>(
	() => {
		return {}
	},
)

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
		if (Object.hasOwn(cardsPlayed.values, game.id)) return
		cardsPlayed.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			let museumEffect: StatusEffectComponent | null = null
			let oldHandSize = player.getHand().length

			newObserver.subscribe(player.hooks.onTurnStart, () => {
				cardsPlayed.get(game)[player.entity] = 0
				oldHandSize = player.getHand().length
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
				const handSize = player.getHand().length
				if (handSize === oldHandSize) return
				oldHandSize = handSize
				if (cardInstance.slot.type === 'single_use') return
				const record = cardsPlayed.get(game)
				const value = (record[player.entity] || 0) + 1
				record[player.entity] = value
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
				museumEffect.counter = value
			})

			newObserver.subscribe(player.hooks.afterApply, () => {
				oldHandSize = player.getHand().length
				const record = cardsPlayed.get(game)
				const value = (record[player.entity] || 0) + 1
				record[player.entity] = value
				if (museumEffect) museumEffect.counter = value
				const singleUse = game.components.find(
					CardComponent,
					query.card.slot(query.slot.singleUse),
				)
				if (!singleUse) return
				newObserver.subscribe(singleUse.hooks.onChangeSlot, (newSlot) => {
					newObserver.unsubscribe(singleUse.hooks.onChangeSlot)
					if (newSlot.type === 'hand' && newSlot.player === player)
						oldHandSize = player.getHand().length
				})
			})

			newObserver.subscribeWithPriority(
				player.hooks.onTurnEnd,
				onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
				() => {
					museumEffect?.remove()
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

				let counter = cardsPlayed.get(game)[player.entity]
				if (counter === undefined) return

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
