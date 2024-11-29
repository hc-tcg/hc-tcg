import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import Wolf from '../../attach/wolf'
import {hermit} from '../../defaults'
import {Card, Hermit} from '../../types'
import Cat from '../attach/cat'
import ElderGuardian from '../attach/elder-guardian'

const mobCards: Card[] = [Cat, Wolf, ElderGuardian]

const ZookeeperScarRare: Hermit = {
	...hermit,
	id: 'zookeeperscar_rare',
	numericId: 254,
	name: 'Zookeeper Scar',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'balanced',
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
		const {player} = component

		const attachedCards: CardComponent[] = []

		const attachCard = (card: CardComponent) => {
			console.log(card.props.name)

			const newObserver = game.components.new(ObserverComponent, card.entity)
			card.props.onAttach(game, component, newObserver)
			attachedCards.push(card)
		}

		const detachCard = (card: CardComponent) => {
			const cardObserver = game.components.find(
				ObserverComponent,
				(_game, value) =>
					value.wrappingEntity === card.entity &&
					value.entity !== card.observerEntity,
			)
			if (!cardObserver) return // Card probably destroyed at some point
			cardObserver.unsubscribeFromEverything()
			card.props.onDetach(game, component, cardObserver)
			game.components.delete(cardObserver.entity)
			const popIndex = attachedCards.findIndex(
				(attachedCard) => attachedCard === card,
			)
			attachedCards.splice(popIndex)
		}

		game.components
			.filter(
				CardComponent,
				query.card.is(...mobCards),
				query.card.slot(query.slot.player(player.entity)),
				query.card.slot(query.slot.attach),
			)
			.forEach(attachCard)

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.slot.player !== player) return
			if (!mobCards.includes(card.props)) return
			if (attachedCards.includes(card)) return
			if (
				card.slot.inRow() &&
				component.slot.inRow() &&
				card.slot.row === component.slot.row
			)
				return

			attachCard(card)
		})

		observer.subscribe(player.hooks.onDetach, (card) => {
			if (card === component) {
				attachedCards.forEach(detachCard)
			}
			if (!attachedCards.includes(card)) return

			detachCard(card)
		})
	},
}

export default ZookeeperScarRare
