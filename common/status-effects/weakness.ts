import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CARDS, HERMIT_CARDS} from '../cards'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {getActiveRow, applyStatusEffect, applyDummyStatusEffect, removeStatusEffect, removeDummyStatusEffect} from '../utils/board'
import {AttackModel} from '../models/attack-model'
import {StatusEffectT, GenericActionResult} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'
import {STRENGTHS} from '../const/strengths'
import { WEAKNESS_DAMAGE } from '../const/damage'

class WeaknessStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'weakness',
			name: 'Weakness',
			description: "This will assign dummies for UI.",
			duration: 3,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const { player, opponentPlayer } = pos
		const strongType = 'balanced' // @TODO Implement this thing.
		const weakType = 'farm'

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		STRENGTHS[strongType].push(weakType)

		opponentPlayer.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
				STRENGTHS[strongType] = STRENGTHS[strongType].filter((a) => a !== weakType)
		})

		player.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			if (!STRENGTHS[strongType].includes(weakType)) {
				STRENGTHS[strongType].push(weakType)
			}

			// @TODO Implement start of turn dummy distribution.
		})

		// Apply visual indicators for the player.
		player.hooks.onCardPlay.add(statusEffectInfo.statusEffectInstance, (card) => {
			const cardType = CARDS[card.cardId].type

			if (cardType == 'hermit') {
				const hermitType = HERMIT_CARDS[card.cardId]
				if (hermitType == weakType) {
					applyDummyStatusEffect(game, 'weaknessdummy', "receiverWeakness", card.cardInstance, statusEffectInfo.duration!)
				}
			}
		})

		// Apply visual indicators for the opponent.
		opponentPlayer.hooks.onCardPlay.add(statusEffectInfo.statusEffectInstance, (card) => {
			const cardType = CARDS[card.cardId].type

			if (cardType == 'hermit') {
				const hermitType = HERMIT_CARDS[card.cardId]
				if (hermitType == weakType) {
					applyDummyStatusEffect(game, 'weaknessdummy', Math.random().toString(), card.cardInstance, statusEffectInfo.duration!)
				}
			}
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onCardPlay.remove(statusEffectInfo.statusEffectInstance)
		opponentPlayer.hooks.onCardPlay.remove(statusEffectInfo.statusEffectInstance)
	}
}

class WeaknessDummyStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'weaknessdummy',
			name: 'Weakness',
			description: "This hermit currently has modified weaknesses.",
			duration: -1,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const { player, opponentPlayer } = pos

		if (statusEffectInfo.statusEffectId == "receiverWeakness") {
			player.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
			})
		} else {
			opponentPlayer.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
			})
		}

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != statusEffectInfo.targetInstance) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const { player, opponentPlayer } = pos

		if (statusEffectInfo.statusEffectId == "receiverWeakness") {
			player.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		} else {
			opponentPlayer.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		}
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default WeaknessStatusEffect
