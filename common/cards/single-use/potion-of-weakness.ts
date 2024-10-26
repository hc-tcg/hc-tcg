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
	numericId: 146,
	name: 'Potion of Weakness',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 2,
	description:
		"Your opponent's active Hermit's type becomes weak to your active Hermit's type for 3 turns.",
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
			const a = game.opponentPlayer.getActiveHermit()?.isHermit()
			if (!a) return false
			return a
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
