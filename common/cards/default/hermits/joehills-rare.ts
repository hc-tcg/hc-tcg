import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {MultiturnSecondaryAttackDisabledEffect} from '../../../status-effects/multiturn-attack-disabled'
import TurnSkippedEffect from '../../../status-effects/turn-skipped'
import UsedClockEffect from '../../../status-effects/used-clock'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class JoeHillsRare extends Card {
	props: Hermit = {
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
				'Flip a coin.\nIf heads, your opponent skips their next turn. "Time Skip" can not be used consecutively if successful.',
		},
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'turnSkip',
			},
		],
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
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

			const coinFlip = flipCoin(player, component)
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
				.filter(
					CardComponent,
					query.card.currentPlayer,
					query.card.is(JoeHillsRare),
				)
				.forEach((joe) =>
					game.components
						.new(
							StatusEffectComponent,
							MultiturnSecondaryAttackDisabledEffect,
							component.entity,
						)
						.apply(joe.entity),
				)
		})
	}
}

export default JoeHillsRare
