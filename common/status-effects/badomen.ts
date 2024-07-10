import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance as StatusEffectInstance} from '../types/game-state'
import {CARDS} from '../cards'
import {slot} from '../filters'

class BadOmenStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'badomen',
		name: 'Bad Omen',
		description: 'All coinflips are tails.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		if (!instance.counter) instance.counter = this.props.counter

		if (pos.cardId) {
			game.battleLog.addEntry(player.id, `$p${pos.cardId.props.name}$ was inflicted with $bBad Omen$`)
		}

		opponentPlayer.hooks.onTurnStart.add(instance, () => {
			if (!instance.counter) return
			instance.counter--

			if (instance.counter === 0) removeStatusEffect(game, pos, instance)
		})

		player.hooks.onCoinFlip.addBefore(instance, (card, coinFlips) => {
			const targetPos = game.findSlot(slot.hasInstance(instance.target))

			// Only modify when the target hermit is "flipping"
			const {currentPlayer} = game
			if (
				instance.target.id !== card.id &&
				(currentPlayer.id !== player.id || player.board.activeRow !== targetPos?.rowIndex)
			) {
				return coinFlips
			}

			for (let i = 0; i < coinFlips.length; i++) {
				if (coinFlips[i]) coinFlips[i] = 'tails'
			}
			return coinFlips
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onCoinFlip.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
	}
}

export default BadOmenStatusEffect
