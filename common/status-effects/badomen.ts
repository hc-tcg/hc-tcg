import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {removeStatusEffect} from '../utils/board'
import {CARDS} from '../cards'
import {slot} from '../components/query'
import {StatusEffectComponent} from '../components'

class BadOmenStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'badomen',
		name: 'Bad Omen',
		description: 'All coinflips are tails.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, component: StatusEffectComponent) {
		const {player, opponentPlayer} = component

		if (!component.counter) component.counter = this.props.counter

		if (pos.cardId) {
			game.battleLog.addEntry(
				player.entity,
				`$p${pos.cardId.props.name}$ was inflicted with $bBad Omen$`
			)
		}

		opponentPlayer.hooks.onTurnStart.add(component, () => {
			if (!component.counter) return
			component.counter--

			if (component.counter === 0) removeStatusEffect(game, pos, instance)
		})

		player.hooks.onCoinFlip.addBefore(instance, (card, coinFlips) => {
			const targetPos = game.findSlot(slot.hasInstance(instance.target))

			// Only modify when the target hermit is "flipping"
			const {currentPlayer} = game
			if (
				instance.target.entity !== card.entity &&
				(currentPlayer.entity !== player.entity || player.board.activeRow !== targetPos?.rowIndex)
			) {
				return coinFlips
			}

			for (let i = 0; i < coinFlips.length; i++) {
				if (coinFlips[i]) coinFlips[i] = 'tails'
			}
			return coinFlips
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onCoinFlip.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
	}
}

export default BadOmenStatusEffect
