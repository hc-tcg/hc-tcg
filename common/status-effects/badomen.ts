import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance as StatusEffectInstance} from '../types/game-state'
import {CARDS} from '../cards'
import {slot} from '../slot'

class BadOmenStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'badomen',
		name: 'Bad Omen',
		description: 'All coinflips are tails.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		if (!statusEffectInfo.counter) statusEffectInfo.counter = this.props.counter

		if (pos.card) {
			game.battleLog.addEntry(player.id, `$p${pos.card.props.name}$ was inflicted with $bBad Omen$`)
		}

		opponentPlayer.hooks.onTurnStart.add(statusEffectInfo, () => {
			if (!statusEffectInfo.counter) return
			statusEffectInfo.counter--

			if (statusEffectInfo.counter === 0) removeStatusEffect(game, pos, statusEffectInfo)
		})

		player.hooks.onCoinFlip.addBefore(statusEffectInfo, (card, coinFlips) => {
			const targetPos = game.findSlot(slot.hasInstance(statusEffectInfo.targetInstance))

			// Only modify when the target hermit is "flipping"
			const {currentPlayer} = game
			if (
				statusEffectInfo.targetInstance.instance !== card.instance &&
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

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onCoinFlip.remove(statusEffectInfo)
		opponentPlayer.hooks.onTurnStart.remove(statusEffectInfo)
	}
}

export default BadOmenStatusEffect
