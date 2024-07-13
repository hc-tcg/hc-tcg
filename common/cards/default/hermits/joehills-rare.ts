import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class JoeHillsRareHermitCard extends Card {
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
		const {player, opponentPlayer} = pos
		let skipped: CardComponent | null = null

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component)) return
			const attacker = attack.getAttacker()
			if (!attacker || attack.type !== 'secondary') return

			if (game.state.statusEffects.some((effect) => effect.props.id === 'used-clock')) {
				return
			}

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 1)
			if (coinFlip[0] !== 'heads') return

			attack.updateLog(
				(values) => ` ${values.previousLog}, then skipped {$o${values.opponent}'s$|your} turn`
			)

			// This will tell us to block actions at the start of our next turn
			// Storing the cardInstance of the card that attacked
			skipped = attacker.row.hermitCard

			applyStatusEffect(game, 'used-clock', getActiveRow(opponentPlayer)?.hermitCard)

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

		// Block secondary attack if we skipped
		player.hooks.onTurnStart.add(component, () => {
			const sameActive = game.activeRow?.hermitCard === skipped
			if (skipped !== null && sameActive) {
				// We skipped last turn and we are still the active hermit, block secondary attacks
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
			}

			skipped = null
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
		player.hooks.onTurnStart.remove(component)
	}
}

export default JoeHillsRareHermitCard
