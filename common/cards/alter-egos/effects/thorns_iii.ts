import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeDefence, onTurnEnd} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'
import DiamondArmor from '../../default/effects/diamond-armor'
import GoldArmor from '../../default/effects/gold-armor'
import IronArmor from '../../default/effects/iron-armor'
import NetheriteArmor from '../../default/effects/netherite-armor'

const ThornsIII: Attach = {
	...attach,
	id: 'thorns_iii',
	numericId: 124,
	name: 'Thorns III',
	expansion: 'alter_egos',
	rarity: 'ultra_rare',
	tokens: 4,
	description:
		"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 40hp damage.\nIgnores armour.",
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component
		let hasTriggered = false

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.EFFECT_CREATE_BACKLASH,
			(attack) => {
				// If we have already triggered once this turn do not do so again
				if (hasTriggered) return
				if (!component.slot.inRow()) return
				// Only when the opponent attacks us
				if (!attack.isTargeting(component) || attack.player !== opponentPlayer)
					return

				if (
					!attack.isType('primary', 'secondary', 'effect') ||
					attack.isBacklash
				)
					return
				// Only return a backlash attack if the attack did damage
				if (attack.calculateDamage() <= 0) return

				let opponentActiveHermit = opponentPlayer.getActiveHermit()
				if (!opponentActiveHermit?.slot.inRow()) return

				hasTriggered = true

				const backlashAttack = game
					.newAttack({
						attacker: component.entity,
						target: opponentActiveHermit.slot.rowEntity,
						type: 'effect',
						isBacklash: true,
						log: (values) =>
							`${values.target} took ${values.damage} damage from $eThorns$`,
					})
					.addDamage(component.entity, 40)

				backlashAttack.shouldIgnoreCards.push(
					query.card.is(GoldArmor, IronArmor, DiamondArmor, NetheriteArmor),
				)

				attack.addNewAttack(backlashAttack)
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				hasTriggered = false
			},
		)
	},
}

export default ThornsIII
