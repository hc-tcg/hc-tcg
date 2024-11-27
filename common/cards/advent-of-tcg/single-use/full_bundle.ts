import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import BundledStatusEffect from '../../../status-effects/bundled'
import {applyCard, applySingleUse} from '../../../utils/board'
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
	description: 'Play this card to play both bundled single use cards.',
	attachCondition(game, value) {
		if (!query.slot.singleUse(game, value)) return false

		const bundledCards = game.components.filter(
			CardComponent<SingleUse>,
			(_game, cardValue) =>
				cardValue.getStatusEffect(BundledStatusEffect)?.creator ===
				value.getCard(),
		)

		let canAttach = true
		bundledCards.forEach((card) => {
			canAttach &&= card.props.attachCondition(game, value)
		})

		return canAttach
	},
	hasAttack(game: GameModel) {
		const suCard = game.components.find(
			CardComponent<SingleUse>,
			query.card.slot(query.slot.singleUse),
		)
		const bundledCards = game.components.filter(
			CardComponent<SingleUse>,
			(_game, value) =>
				value.getStatusEffect(BundledStatusEffect)?.creator === suCard,
		)

		let hasAttack = false

		bundledCards.forEach((card) => {
			hasAttack ||= card.hasSingleUseAttack()
		})

		return hasAttack
	},
	attackPreview(game) {
		const suCard = game.components.find(
			CardComponent<SingleUse>,
			query.card.slot(query.slot.singleUse),
		)
		const bundledCards = game.components.filter(
			CardComponent<SingleUse>,
			(_game, value) =>
				value.getStatusEffect(BundledStatusEffect)?.creator === suCard,
		)

		let attackPreview = ''

		bundledCards.forEach((card) => {
			const prefix = attackPreview ? ' + ' : ''
			if (card.props.attackPreview)
				attackPreview += prefix + card.props.attackPreview(game)
			console.log(attackPreview)
		})

		return attackPreview
	},
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const bundledCards = game.components.filter(
			CardComponent<SingleUse>,
			(_game, value) =>
				value.getStatusEffect(BundledStatusEffect)?.creator === component,
		)

		observer.subscribe(player.hooks.onApply, () => {
			bundledCards.forEach((card) => {
				applyCard(card as CardComponent<SingleUse>)
			})
		})

		game.addModalRequest({
			player: player.entity,
			modal: {
				type: 'selectCards',
				name: 'Play these cards?',
				description: 'Playing this full bundle will play these single use cards.',
				cards: bundledCards.map((card) => card.entity),
				selectionSize: 0,
				primaryButton: {
					text: 'Confirm',
				},
				secondaryButton: {
					text: 'Cancel',
					variant: 'error',
				},
				cancelable: true,
			},
			onResult(result) {
				if (!result) return
				if (!result.result) return

				bundledCards.forEach((card) => {
					const cardObserver = game.components.new(ObserverComponent, card.entity)
					card.props.onAttach(game, card, cardObserver)
				})

				applySingleUse(game)
			},
			onTimeout() {}
		})
	},
	onDetach(game, component, _observer) {
		const bundledCards = game.components.filter(
			CardComponent<SingleUse>,
			(_game, value) =>
				value.getStatusEffect(BundledStatusEffect)?.creator === component,
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
