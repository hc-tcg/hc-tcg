import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import TimeSkipDisabledEffect from '../../status-effects/time-skip-disabled'
import TurnSkippedEffect from '../../status-effects/turn-skipped'
import UsedClockEffect from '../../status-effects/used-clock'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const JoeHillsRare: Hermit = {
	...hermit,
	id: 'joehills_rare',
	numericId: 70,
	name: 'Joe',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	type: 'farm',
	health: 270,
	primary: {
		name: 'Grow Hills',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Time Skip',
		cost: ['farm', 'farm', 'any'],
		damage: 90,
		power:
			'Flip a coin.\nIf heads, your opponent skips their next turn. "Time Skip" can not be used on consecutive turns if successful.',
	},
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'turnSkip',
		},
	],
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (
					game.components.exists(
						StatusEffectComponent,
						query.effect.is(UsedClockEffect),
						query.effect.targetEntity(player.entity),
					)
				) {
					return
				}

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] !== 'heads') return

				attack.updateLog(
					(values) =>
						` ${values.previousLog}, then skipped {$o${values.opponent}'s$|your} turn`,
				)

				game.components
					.new(StatusEffectComponent, TurnSkippedEffect, component.entity)
					.apply(opponentPlayer.entity)
				game.components
					.new(StatusEffectComponent, UsedClockEffect, component.entity)
					.apply(player.entity)
				game.components
					.new(StatusEffectComponent, TimeSkipDisabledEffect, component.entity)
					.apply(player.entity)
			},
		)

		observer.subscribe(player.hooks.blockedActions, (blockedActions) => {
			if (
				!blockedActions.includes('SECONDARY_ATTACK') &&
				game.components.exists(
					StatusEffectComponent,
					query.effect.is(TimeSkipDisabledEffect),
					query.effect.targetIsPlayerAnd(query.player.entity(player.entity)),
				) &&
				query.every(query.card.active, query.card.is(JoeHillsRare))(
					game,
					component,
				)
			)
				blockedActions.push('SECONDARY_ATTACK')

			return blockedActions
		})
	},
}

export default JoeHillsRare
