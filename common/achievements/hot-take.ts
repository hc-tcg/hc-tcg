import {CardComponent} from '../components'
import query from '../components/query'
import FireEffect from '../status-effects/fire'
import {afterApply, onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HotTake: Achievement = {
	...achievement,
	numericId: 17,
	id: 'hot_take',
	levels: [
		{
			name: 'Hot Take',
			description: 'Have 3 opponent hermits be on fire simultaneously.',
			steps: 3,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		const checkStatusEffects = () => {
			const burningHermits = game.components.filter(
				CardComponent,
				query.card.opponentPlayer,
				query.card.onBoard,
				query.card.hasStatusEffect(FireEffect),
			)
			component.bestGoalProgress({goal: 0, progress: burningHermits.length})
		}

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			checkStatusEffects,
		)
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			checkStatusEffects,
		)
	},
}

export default HotTake
