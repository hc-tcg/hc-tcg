import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import HandBlockEffect from '../../../status-effects/hand-block'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const BlockingBed: SingleUse = {
	...singleUse,
	id: 'blocking_bed',
	numericId: 271,
	name: 'Blocking Bed',
	expansion: 'beds',
	rarity: 'ultra_rare',
	tokens: 2,
	description: 'The opponent player cannot play cards on their next turn.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(game, _pos) => game.state.turn.turnNumber !== 1,
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, HandBlockEffect, component.entity)
				.apply(opponentPlayer.entity)
		})
	},
}

export default BlockingBed
