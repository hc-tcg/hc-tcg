import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import WeaknessEffect from '../../status-effects/weakness'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const PotionOfWeakness: SingleUse = {
	...singleUse,
	id: 'potion_of_weakness',
	numericId: 123,
	name: 'Potion of Weakness',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 2,
	description:
		"Your opponent's active Hermit's type(s) becomes weak to your active Hermit's type(s) for 3 turns.",
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'weak',
		},
	],
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.opponentHasActiveHermit,
		(game, _pos) => {
			const opponentActive = game.opponentPlayer.getActiveHermit()
			if (!opponentActive) return false
			if (!opponentActive.isHermit()) return false
			if (!opponentActive.props.type) return false
			return true
		},
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, WeaknessEffect, component.entity)
				.apply(opponentPlayer.entity)
		})
	},
}

export default PotionOfWeakness
