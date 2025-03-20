import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {CardEntity} from '../../../entities'
import Wolf from '../../attach/wolf'
import {InstancedValue} from '../../card'
import {hermit} from '../../defaults'
import {Card, Hermit} from '../../types'
import Cat from '../attach/cat'
import ElderGuardian from '../attach/elder-guardian'

const mobCards: Card[] = [Cat, Wolf, ElderGuardian]

type AttachedMobInfo = {
	readonly observer: ObserverComponent
	/** Whether this card is "attached" with Lasso */
	attached: boolean
}

const attachedCards = new InstancedValue<Record<CardEntity, AttachedMobInfo>>(
	() => ({}),
)

const ZookeeperScarRare: Hermit = {
	...hermit,
	id: 'zookeeperscar_rare',
	numericId: 1402,
	name: 'Zookeeper Scar',
	shortName: 'Zookeeper',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'rare',
	tokens: 3,
	type: ['balanced'],
	health: 280,
	primary: {
		name: 'Lasso',
		cost: [],
		damage: 0,
		power:
			'Mob cards attached to your board act as though they are also attached to this hermit.',
		passive: true,
	},
	secondary: {
		name: 'Choo Choo',
		cost: ['balanced', 'balanced', 'balanced'],
		damage: 100,
		power: null,
	},
	onAttach(game, component, observer) {
		// Prevent mocking passive
		if (component.props !== this) return

		const {player} = component

		attachedCards.set(component, {})

		const attachCard = (card: CardComponent) => {
			const newObserver = attachedCards.get(component)[card.entity].observer
			card.props.onAttach(game, component, newObserver)
			attachedCards.get(component)[card.entity].attached = true
			newObserver.subscribe(card.hooks.onChangeSlot, (newSlot) => {
				if (!newSlot.inRow() || !component.slot.inRow()) return
				if (newSlot.rowEntity !== component.slot.rowEntity) return
				newObserver.unsubscribe(card.hooks.onChangeSlot)
				detachCard(card)
			})
		}

		const detachCard = (card: CardComponent) => {
			const cardObserver = attachedCards.get(component)[card.entity].observer
			if (!cardObserver) return // Card probably destroyed at some point
			cardObserver.unsubscribeFromEverything()
			card.props.onDetach(game, component, cardObserver)
			attachedCards.get(component)[card.entity].attached = false
		}

		game.components
			.filter(
				CardComponent,
				query.card.is(...mobCards),
				query.card.slot(query.slot.player(player.entity)),
				query.card.slot(query.slot.attach),
			)
			.forEach((card) => {
				attachedCards.get(component)[card.entity] = {
					observer: game.components.new(ObserverComponent, card.entity),
					attached: false,
				}
				attachCard(card)
			})

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.slot.player !== player) return
			if (!mobCards.includes(card.props)) return
			if (card.entity in attachedCards.get(component)) return

			const observer = game.components.new(ObserverComponent, card.entity)
			attachedCards.get(component)[card.entity] = {observer, attached: false}

			if (
				card.slot.inRow() &&
				component.slot.inRow() &&
				card.slot.row === component.slot.row
			) {
				observer.subscribe(card.hooks.onChangeSlot, (newSlot) => {
					if (!newSlot.inRow() || !component.slot.inRow()) return
					if (newSlot.row === component.slot.row) return
					observer.unsubscribe(card.hooks.onChangeSlot)
					attachCard(card)
				})
				return
			}

			attachCard(card)
		})

		observer.subscribe(player.hooks.onDetach, (card) => {
			if (!(card.entity in attachedCards.get(component))) return

			detachCard(card)
			game.components.delete(
				attachedCards.get(component)[card.entity].observer.entity,
			)
			delete attachedCards.get(component)[card.entity]
		})

		observer.subscribe(component.hooks.onChangeSlot, (newSlot) => {
			Object.entries(attachedCards.get(component)).forEach(
				([cardEntity, {attached}]) => {
					const card = game.components.get(cardEntity as CardEntity)
					if (!newSlot.inRow() || !card?.slot.inRow()) return
					if (newSlot.row !== card.slot.row) {
						if (attached) return
						attachCard(card)
					} else {
						if (!attached) return
						detachCard(card)
					}
				},
			)
		})
	},
	onDetach(game, component, _observer) {
		Object.entries(attachedCards.get(component)).forEach(
			([cardEntity, {observer, attached}]) => {
				observer.unsubscribeFromEverything()
				if (attached)
					game.components
						.get(cardEntity as CardEntity)
						?.props.onDetach(game, component, observer)
				game.components.delete(observer.entity)
			},
		)
		attachedCards.clear(component)
	},
}

export default ZookeeperScarRare
