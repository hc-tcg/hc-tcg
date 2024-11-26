import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {flipCoin} from '../utils/coinFlips'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const TrapHoleEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'trap-hole',
	name: 'Trap Hole',
	icon: 'trap-hole',
	description:
		'When you use a single use effect card, flip a coin. If heads, your opponent steals said effect card.',
	applyCondition: (_game, value) =>
		value instanceof PlayerComponent && !value.hasStatusEffect(TrapHoleEffect),
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeBefore(player.hooks.afterApply, () => {
			let singleUseCard = game.components.find(
				CardComponent,
				query.card.slot(query.slot.singleUse),
			)
			if (!singleUseCard) return

			const coinFlip = flipCoin(
				game,
				player.opponentPlayer,
				effect.creator,
				1,
				player,
			)

			if (coinFlip[0] == 'heads') {
				game.battleLog.addEntry(
					player.entity,
					`$o${effect.creator.props.name}$ flipped $pheads$ and took $e${singleUseCard.props.name}$`,
				)
				singleUseCard.draw(player.opponentPlayer.entity)
			} else {
				game.battleLog.addEntry(
					player.entity,
					`$o${effect.creator.props.name}$ flipped $btails$`,
				)
			}
		})
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}
