import ZedaphPlaysCommon from '../cards/hermits/zedaphplays-common'
import ZedaphPlaysRare from '../cards/hermits/zedaphplays-rare'
import {CardComponent} from '../components'
import query from '../components/query'
import {CardEntity} from '../entities'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const zedaphCards = [ZedaphPlaysCommon, ZedaphPlaysRare]

const SheepStarer: Achievement = {
	...achievement,
	numericId: 14,
	id: 'sheep_starer',

	levels: [
		{
			name: 'Sheep Starer',
			description:
				'Keep a red HP (100 - 0) Zedaph alive for three consecutive turns.',
			steps: 3,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		const redZedaphs: Record<CardEntity, number> = {}

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				const thisTurnRedZedaphs = game.components.filterEntities(
					CardComponent,
					query.card.is(...zedaphCards),
					query.card.row(
						(_game, row) => row.health !== null && row.health <= 100,
					),
				)
				Object.keys(redZedaphs).forEach((card: string) => {
					if (!thisTurnRedZedaphs.includes(card as CardEntity))
						delete redZedaphs[card as CardEntity]
				})
				thisTurnRedZedaphs.forEach((zedaph) => {
					if (redZedaphs[zedaph]) {
						redZedaphs[zedaph] += 1
					} else {
						redZedaphs[zedaph] = 1
					}
				})
				component.bestGoalProgress({
					goal: 0,
					progress: Math.max(...Object.values(redZedaphs)),
				})
			},
		)
	},
}

export default SheepStarer
