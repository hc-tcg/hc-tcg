import {CardStatusEffect, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'
import * as query from '../components/query'
import FiveAMPearlRare from '../cards/alter-egos-ii/hermits/fiveampearl-rare'
import EthosLabRare from '../cards/default/hermits/ethoslab-rare'
import ArchitectFalseCommon from '../cards/alter-egos-ii/hermits/architectfalse-common'
import ArchitectFalseRare from '../cards/alter-egos-iii/hermits/architectfalse-rare'
import KingJoelCommon from '../cards/alter-egos-iii/hermits/kingjoel-common'
import KingJoelRare from '../cards/alter-egos-iii/hermits/kingjoel-rare'

class RoyalProtectionEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'royal_protection',
		name: 'Royal Protection',
		description: "This hermit takes no damage from King Joel's or Grand Architect's attacks.",
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
				//@TODO Add King Joel here when he's enabled
				query.card.is(ArchitectFalseCommon, ArchitectFalseRare)
			)

			if (royalHermits.includes(attack.attacker)) {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})

		observer.subscribe(target.opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default RoyalProtectionEffect
