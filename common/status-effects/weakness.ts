import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CARDS, HERMIT_CARDS} from '../cards'
import {CardPosModel} from '../models/card-pos-model'
import {getActiveRow, applyDummyStatusEffect, removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'
import {STRENGTHS} from '../const/strengths'

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
		const {player, opponentPlayer} = pos
		const strongType = HERMIT_CARDS[getActiveRow(opponentPlayer)!.hermitCard.cardId].hermitType
		const weakType = HERMIT_CARDS[getActiveRow(player)!.hermitCard.cardId].hermitType

		function applyDummies() {
			for (let i = 0; i < player.board.rows.length; i++) {
				const row = opponentPlayer.board.rows[i]

				if (row.hermitCard) {
					const card = row.hermitCard
					if (HERMIT_CARDS[card.cardId].hermitType == weakType) {
						applyDummyStatusEffect(game, 'weaknessdummy', Math.random().toString(), card.cardInstance, statusEffectInfo.duration!)
					}
				}
			}
			for (let i = 0; i < player.board.rows.length; i++) {
				const row = player.board.rows[i]

				if (row.hermitCard) {
					const card = row.hermitCard
					if (HERMIT_CARDS[card.cardId].hermitType == weakType) {
						applyDummyStatusEffect(game, 'weaknessdummy', "receiverWeakness", card.cardInstance, statusEffectInfo.duration!)
					}
				}
			}
		}

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		applyDummies()

		STRENGTHS[strongType].push(weakType)

		player.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
				STRENGTHS[strongType] = STRENGTHS[strongType].filter((a) => a !== weakType)
		})

		opponentPlayer.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			if (!STRENGTHS[strongType].includes(weakType)) {
				STRENGTHS[strongType].push(weakType)
			}

			applyDummies()
		})

		player.hooks.onCardPlay.add(statusEffectInfo.statusEffectInstance, (card) => {
			const cardType = CARDS[card.cardId].type

			if (cardType == 'hermit') {
				const hermitType = HERMIT_CARDS[card.cardId].hermitType
				if (hermitType == weakType) {
					applyDummyStatusEffect(game, 'weaknessdummy', "receiverWeakness", card.cardInstance, statusEffectInfo.duration!)
				}
			}
		})

		opponentPlayer.hooks.onCardPlay.add(statusEffectInfo.statusEffectInstance, (card) => {
			const cardType = CARDS[card.cardId].type

			if (cardType == 'hermit') {
				const hermitType = HERMIT_CARDS[card.cardId].hermitType
				if (hermitType == weakType) {
					applyDummyStatusEffect(game, 'weaknessdummy', Math.random().toString(), card.cardInstance, statusEffectInfo.duration!)
				}
			}
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		opponentPlayer.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onCardPlay.remove(statusEffectInfo.statusEffectInstance)
		opponentPlayer.hooks.onCardPlay.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default WeaknessStatusEffect