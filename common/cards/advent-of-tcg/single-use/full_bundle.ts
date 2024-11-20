import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import BundledStatusEffect from '../../../status-effects/bundled'
import {applyCard} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const FullBundle: SingleUse = {
	...singleUse,
	id: 'full_bundle',
	numericId: -2,
	name: 'Full Bundle',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	description:
		'Play this card to play both bundled single use cards.',
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const bundledCards = game.components.filter(
			CardComponent,
			query.card.hasStatusEffect(BundledStatusEffect),
		)

		bundledCards.forEach((card) => {
			const cardObserver = game.components.new(ObserverComponent, card.entity)
			card.props.onAttach(game, card, cardObserver)
		})

		observer.subscribe(player.hooks.onApply, () => {
			bundledCards.forEach((card) => {
				applyCard(card as CardComponent<SingleUse>)
			})
		})
	},
	onDetach(game, _component, _observer) {
		const bundledCards = game.components.filter(
			CardComponent,
			query.card.hasStatusEffect(BundledStatusEffect),
		)

		bundledCards.forEach((card) => {
			const observer = game.components.find(
				ObserverComponent,
				(_game, observer) => observer.wrappingEntity === card.entity,
			)
			if (!observer) return
			card.props.onDetach(game, card, observer)
		})
	},
}

export default FullBundle
