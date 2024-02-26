import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'

class BadOmenStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'badomen',
			name: 'Bad Omen',
			description: 'All coinflips are tails.',
			duration: 3,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player, opponentPlayer} = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		opponentPlayer.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})

		player.hooks.onCoinFlip.add(statusEffectInfo.statusEffectInstance, (id, coinFlips) => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (player.board.activeRow !== targetPos?.rowIndex) return coinFlips

			// If they are not flipping on their turn, don't modify
			const {currentPlayer} = game
			if (currentPlayer.id !== player.id && id !== targetPos.row?.hermitCard?.cardId) {
				return coinFlips
			}

			for (let i = 0; i < coinFlips.length; i++) {
				if (coinFlips[i]) coinFlips[i] = 'tails'
			}
			return coinFlips
		})

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != statusEffectInfo.targetInstance) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onCoinFlip.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default BadOmenStatusEffect
