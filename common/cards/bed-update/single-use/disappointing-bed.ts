import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import DisappointingSwapEffect from '../../../status-effects/disappointing-swap'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const DisappointingBed: SingleUse = {
	...singleUse,
	id: "disappointing_bed",
	numericId: 274,
	name: "Disappointing Bed",
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: -0.5,
	description:
		'Swap the health of your and your opponent\'s active hermit. Before attacking or ending your turn, swap it back.\nYou can use another single use effect card this turn.',
	showConfirmationModal: true,
	attachCondition: singleUse.attachCondition,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			if (!player.activeRow || !player.activeRow.health || !opponentPlayer.activeRow || !opponentPlayer.activeRow.health) return
			let placeholder = player.activeRow.health
			player.activeRow.health = opponentPlayer.activeRow.health
			opponentPlayer.activeRow.health = placeholder

			game.components
				.new(StatusEffectComponent, DisappointingSwapEffect, component.entity)
				.apply(player.entity)

			if (component.slot.onBoard()) component.discard()
			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
			player.singleUseCardUsed = false
		})
	},
}

export default DisappointingBed
