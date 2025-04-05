import {CardComponent, StatusEffectComponent} from '../../../components'
import query from '../../../components/query'
import PermanentSleepingEffect from '../../../status-effects/permanent-sleeping'
import SleepingEffect from '../../../status-effects/sleeping'
import {afterApply} from '../../../types/priorities'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const UncomfyBed: SingleUse = {
	...singleUse,
	id: 'uncomfy_bed',
	name: 'Uncomfy Bed',
	expansion: 'beds',
	numericId: 263,
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'Remove all sleep effects from the board. Any hermits that were sleeping have their health set to 80hp.',
	showConfirmationModal: true,
	onAttach(game, component, observer) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CLEAR_STATUS_EFFECT,
			() => {
				let removeFrom = game.components.filter(
					StatusEffectComponent,
					query.some(
						query.effect.is(SleepingEffect),
						query.effect.is(PermanentSleepingEffect),
					),
				)

				if (removeFrom.length === 0) return

				removeFrom.forEach((effect) => {
					if (
						effect.target instanceof CardComponent &&
						effect.target.slot.inRow()
					) {
						effect.target.slot.row.health = 80
					}
					effect.remove()
				})
			},
		)
	},
}

export default UncomfyBed
