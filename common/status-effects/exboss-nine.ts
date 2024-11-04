import {InstancedValue} from '../cards/card'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

export type NINE_SPECIAL = 'NINEDISCARD' | 'NINEATTACHED'

const nineSpecial = new InstancedValue<NINE_SPECIAL | null>(() => null)

export const supplyNineSpecial = (
	effect: StatusEffectComponent,
	value: NINE_SPECIAL,
) => {
	nineSpecial.set(effect.creator, value)
}

const ExBossNineEffect: Counter<CardComponent> = {
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

				const special = nineSpecial.get(effect.creator)
				switch (special) {
					case 'NINEDISCARD':
						// Discard the opponent's hand and have them draw one new card
						game.battleLog.addEntry(
							player.entity,
							`{$eYour$|$p${player.playerName}'s$} $eRules$ dictated that {$o${opponentPlayer.playerName}$|you} must discard {their|your} hand and draw a new card`,
						)
						game.components
							.filter(
								CardComponent,
								query.card.slot(query.slot.hand),
								query.card.opponentPlayer,
							)
							.forEach((card) => card.discard())
						opponentPlayer.draw(1)
						break
					case 'NINEATTACHED':
						// Discard all cards attached to the opponent's active hermit
						game.battleLog.addEntry(
							player.entity,
							`{$eYour$|$p${player.playerName}'s$} $eRules$ dictated that {$o${opponentPlayer.playerName}$|you} must discard everything from {their|your} active Hermit`,
						)
						game.components
							.find(
								CardComponent,
								query.card.active,
								query.card.opponentPlayer,
								query.card.slot(
									query.slot.attach,
									query.not(query.slot.frozen),
								),
							)
							?.discard()
						game.components
							.filter(
								CardComponent,
								query.card.active,
								query.card.opponentPlayer,
								query.card.slot(query.slot.item, query.not(query.slot.frozen)),
							)
							.forEach((card) => card.discard())
						break
				}

				effect.remove()
				nineSpecial.clear(effect.creator)
			},
		)
	},
}

export default ExBossNineEffect
