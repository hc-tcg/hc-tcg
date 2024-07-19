import {
	StatusEffectComponent,
	CardComponent,
	ObserverComponent,
	PlayerComponent,
} from '../components'
import {card, slot} from '../components/query'
import {GameModel} from '../models/game-model'
import {flipCoin} from '../utils/coinFlips'
import {PlayerStatusEffect, StatusEffectProps, hiddenStatusEffect} from './status-effect'

export class TrapHoleEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		name: 'Trap Hole',
		icon: 'trap-hole',
		description:
			'When you use a single use effect card, flip a coin. If heads, your opponent steals said effect card.',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.onApply, () => {
			let singleUseCard = game.components.find(CardComponent, card.slot(slot.singleUse))
			if (!singleUseCard) return
			let opponentActiveHermit = player.opponentPlayer.getActiveHermit()
			if (!opponentActiveHermit) return

			const coinFlip = flipCoin(player, opponentActiveHermit)

			if (coinFlip[0] == 'heads') {
				game.battleLog.addEntry(
					player.entity,
					`$p${opponentActiveHermit.props.name}$ flipped $pheads$ and took $e${singleUseCard.props.name}$`
				)
				singleUseCard.draw(player.opponentPlayer.entity)
			} else {
				game.battleLog.addEntry(
					player.entity,
					`$p${opponentActiveHermit.props.name}$ flipped $btails$b`
				)
			}
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}
