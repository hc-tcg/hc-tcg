import {broadcast} from '../../server/src/utils/comm'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {serverMessages} from '../socket-messages/server-messages'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const ExBossNineStatusEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'exboss-nine',
	icon: 'exboss-nine',
	name: 'Boss Rules',
	description:
		"At the end of EX's ninth turn, an additional move will be performed.",
	counter: 8, // Starts at 8 and triggers at 0 turns remaining
	counterType: 'turns',

	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player, opponentPlayer} = target
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (effect.counter === null) effect.counter = this.counter
			effect.counter -= 1
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter !== 0) return

				let voiceLine: string
				if (Math.random() > 0.5) {
					// Discard the opponent's hand and have them draw one new card
					voiceLine = 'NINEDISCARD'
					game.battleLog.addEntry(
						player.entity,
						`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard {their|your} hand and draw a new card`,
					)
					game.components
						.filter(
							CardComponent,
							query.card.slot(query.slot.hand),
							query.card.opponentPlayer,
						)
						.forEach((card) => card.discard())
					opponentPlayer.draw(1)
				} else {
					// Discard all cards attached to the opponent's active hermit
					voiceLine = 'NINEATTACHED'
					game.battleLog.addEntry(
						player.entity,
						`$p{Your|${player.playerName}'s}$ $eRules$ dictated that $o{${opponentPlayer.playerName}|you}$ must discard everything from {their|your} active Hermit`,
					)
					game.components
						.filter(
							CardComponent,
							query.card.active,
							query.card.opponentPlayer,
							query.some(
								query.card.slot(
									query.slot.attach,
									query.not(query.slot.frozen),
								),
								query.card.slot(query.slot.item),
							),
						)
						.forEach((card) => card.discard())
				}

				effect.remove()
				broadcast(game.getPlayers(), {
					type: serverMessages.VOICE_ANNOUNCE,
					lines: [voiceLine],
				})
				game.battleLog.sendLogs()
			},
		)
	},
}

export default ExBossNineStatusEffect
