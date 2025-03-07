import Fortune from '../cards/single-use/fortune'
import {SlotComponent} from '../components'
import query from '../components/query'
import BadOmenEffect from '../status-effects/badomen'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const SignalInversion: Achievement = {
	...achievement,
	numericId: 52,
	id: 'signal-inversion',
	levels: [
		{
			name: 'Signal Inversion',
			description: 'Use Fortune to flip heads while yous active Hermit has the Bad Omen status effect.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components.find(SlotComponent, query.slot.singleUse)?.card
				if (!su) return
				if (su.props.id !== Fortune.id) return

				let hasBadOmen = player.getActiveHermit()?.getStatusEffect(BadOmenEffect)
				if (!hasBadOmen) return

				component.incrementGoalProgress({goal: 0})
			},
		)
	},
}

export default SignalInversion
