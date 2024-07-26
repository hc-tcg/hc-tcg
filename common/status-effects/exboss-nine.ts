import {GameModel} from '../models/game-model'
import {CardStatusEffect, Counter, StatusEffectProps, systemStatusEffect} from './status-effect'
import {broadcast} from '../../server/src/utils/comm'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'
import {card, not, slot, some} from '../components/query'

class ExBossNineStatusEffect extends CardStatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		icon: 'exboss-nine',
		name: 'Boss Rules',
		description: "At the end of EX's ninth turn, an additional move will be performed.",
		counter: 8, // Starts at 8 and triggers at 0 turns remaining
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	): void {
		const {player, opponentPlayer} = target
		if (effect.counter === null) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (effect.counter === null) effect.counter = this.props.counter
			effect.counter -= 1
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (effect.counter !== 0) return

			let voiceLine: string
			if (Math.random() > 0.5) {
				// Discard the opponent's hand and have them draw one new card
				voiceLine = 'NINEDISCARD'
				game.battleLog.addEntry(
					player.entity,
					`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard {their|your} hand and draw a new card`
				)
				game.components
					.filter(CardComponent, card.slot(slot.hand), card.opponentPlayer)
					.forEach((card) => card.discard())
				opponentPlayer.draw(1)
			} else {
				// Discard all cards attached to the opponent's active hermit
				voiceLine = 'NINEATTACHED'
				game.battleLog.addEntry(
					player.entity,
					`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard everything from {their|your} active Hermit`
				)
				game.components
					.filter(
						CardComponent,
						card.active,
						card.opponentPlayer,
						some(card.slot(slot.attach, not(slot.frozen)), card.slot(slot.item))
					)
					.forEach((card) => card.discard())
			}

			effect.remove()
			effect.counter = null // Effects aren't deleted so counter must be invalidated
			broadcast(game.getPlayers(), '@sound/VOICE_ANNOUNCE', {lines: [voiceLine]})
			game.battleLog.sendLogs()
		})
	}
}

export default ExBossNineStatusEffect
