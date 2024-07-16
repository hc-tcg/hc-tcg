import {GameModel} from '../../../models/game-model'
import {CardComponent, StatusEffectComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {effect} from '../../../components/query'
import UsedClockStatusEffect from '../../../status-effects/used-clock'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (
				game.components.exists(
					StatusEffectComponent,
					effect.is(UsedClockStatusEffect),
					effect.targetIs(component.entity)
				)
			)
				return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] !== 'heads') return

			attack.updateLog(
				(values) => ` ${values.previousLog}, then skipped {$o${values.opponent}'s$|your} turn`
			)

			game.components.new(StatusEffectComponent, UsedClockStatusEffect).apply(component.entity)

			// Block all actions of opponent for one turn
			opponentPlayer.hooks.onTurnStart.add(component, () => {
				game.addBlockedActions(
					this.props.id,
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD'
				)
				opponentPlayer.hooks.onTurnStart.remove(component)
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default JoeHillsRare
