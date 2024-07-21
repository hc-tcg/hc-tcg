import {
	StatusEffectComponent,
	CardComponent,
	ObserverComponent,
	PlayerComponent,
} from '../components'
import {card, slot} from '../components/query'
import {GameModel} from '../models/game-model'
import {flipCoin} from '../utils/coinFlips'
import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'

export class TrapHoleEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		name: 'Trap Hole',
		icon: 'trap-hole',
		description:
			'When your opponent uses a single use effect card, flip a coin. If heads, you steal said effect card.',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		const opponentPlayer = target.opponentPlayer

		observer.subscribe(opponentPlayer.hooks.onApply, () => {
			let singleUseCard = game.components.find(CardComponent, card.slot(slot.singleUse))
			if (!singleUseCard) return

			const coinFlip = flipCoin(target.player, target, 1, opponentPlayer)

			if (coinFlip[0] == 'heads') {
				game.battleLog.addEntry(
					target.player.entity,
					`$p${target.props.name}$ flipped $pheads$ and took $e${singleUseCard.props.name}$`
				)
				singleUseCard.draw(target.player.entity)
			} else {
				game.battleLog.addEntry(target.player.entity, `$p${target.props.name}$ flipped $btails$`)
			}
		})
		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}
