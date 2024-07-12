import {CardPosModel} from '../models/card-pos-model'
import {GameModel} from '../models/game-model'
import {slot} from '../slot'
import {StatusEffectInstance} from '../types/game-state'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {discardCard, discardFromHand} from '../utils/movement'
import StatusEffect, {Counter, statusEffect, StatusEffectProps} from './status-effect'
import {broadcast} from '../../server/src/utils/comm'

const effectDiscardCondition = slot.every(
	slot.opponent,
	slot.activeRow,
	slot.attachSlot,
	slot.not(slot.empty),
	slot.not(slot.frozen)
)

class ExBossNineStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'exboss-nine',
		name: 'Boss Rules',
		description: "At the end of EX's ninth turn, an additional move will be performed.",
		counter: 8, // Starts at 8 and triggers at 0 turns remaining
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos
		if (instance.counter === null) instance.counter = this.props.counter

		player.hooks.onTurnStart.add(instance, () => {
			if (instance.counter === null) instance.counter = this.props.counter
			instance.counter -= 1
		})

		player.hooks.onTurnEnd.add(instance, () => {
			if (instance.counter !== 0) return

			let voiceLine: string
			if (Math.random() > 0.5) {
				// Discard the opponent's hand and have them draw one new card
				voiceLine = 'NINEDISCARD'
				game.battleLog.addEntry(
					player.id,
					`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard {their|your} hand and draw a new card`
				)
				opponentPlayer.hand.forEach((card) => discardFromHand(opponentPlayer, card))
				const newCard = opponentPlayer.pile.shift()
				if (newCard) opponentPlayer.hand.push(newCard)
			} else {
				// Discard all cards attached to the opponent's active hermit
				voiceLine = 'NINEATTACHED'
				game.battleLog.addEntry(
					player.id,
					`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard everything from {their|your} active Hermit`
				)
				const opponentActiveRow = getActiveRow(opponentPlayer)
				if (opponentActiveRow) {
					game
						.filterSlots(effectDiscardCondition)
						.map((slot) => slot.card && discardCard(game, slot.card))

					opponentActiveRow.itemCards.forEach((itemCard) => itemCard && discardCard(game, itemCard))
				}
			}

			removeStatusEffect(game, pos, instance)
			broadcast(game.getPlayers(), '@sound/VOICE_ANNOUNCE', {lines: [voiceLine]})
			game.battleLog.sendLogs()
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onTurnStart.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default ExBossNineStatusEffect
