import {CardStatusEffect, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'
import * as query from '../components/query'
import FiveAMPearlRare from '../cards/alter-egos-ii/hermits/fiveampearl-rare'
import EthosLabRare from '../cards/default/hermits/ethoslab-rare'

class RoyalProtectionEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'royal_protection',
		name: 'Royal Protection',
		description: 'This hermit takes no damage from King Joel or Grand Architect attacks',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(target.opponentPlayer.hooks.onAttack, (attack) => {
			if (!attack.isTargetting(target) || !(attack.attacker instanceof CardComponent)) return

			const royalHermits = game.components.filter(
				CardComponent,
				query.card.opponentPlayer,
				query.card.attached,
				query.card.is(FiveAMPearlRare, EthosLabRare) //@TODO: placeholder until cards implemented
			)

			if (royalHermits.includes(attack.attacker)) {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})
	}
}

export default RoyalProtectionEffect
