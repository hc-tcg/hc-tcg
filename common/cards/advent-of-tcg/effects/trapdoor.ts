import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack, beforeDefence} from '../../../types/priorities'
import {getFormattedName} from '../../../utils/game'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Trapdoor: Attach = {
	...attach,
	id: 'trapdoor',
	numericId: 205,
	name: 'Trapdoor',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	description:
		"When an adjacent Hermit takes damage from an opponent's attack, up to 40hp damage is taken by this Hermit instead.",
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let totalReduction = 0

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.TRAPDOOR_INTERCEPT_DAMAGE,
			(attack) => {
				const target = attack.target
				if (
					target?.player.entity !== player.entity ||
					!(attack.attacker instanceof CardComponent) ||
					attack.attacker.player.entity !== opponentPlayer.entity
				)
					return
				if (attack.isType('status-effect') || attack.isBacklash) return
				if (!component.slot.inRow()) return
				if (
					!query.row.adjacent(query.row.entity(component.slot.rowEntity))(
						game,
						target,
					)
				)
					return

				if (totalReduction < 40) {
					const damageReduction = Math.min(
						attack.calculateDamage(),
						40 - totalReduction,
					)
					totalReduction += damageReduction
					attack.addDamageReduction(component.entity, damageReduction)

					const newAttack = game
						.newAttack({
							attacker: attack.attacker.entity,
							target: component.slot.rowEntity,
							type: attack.type,
							log: (values) =>
								` (${values.damage} was intercepted by ${values.target} with ${getFormattedName(
									component.props.id,
									true,
								)})`,
						})
						.addDamage(component.entity, damageReduction)
					// newAttack should not run extra hooks for attacker, or be redirected back to the original target
					newAttack.shouldIgnoreCards.push(
						query.every(
							...attack.shouldIgnoreCards,
							query.card.entity(attack.attacker.entity),
							query.card.rowEntity(attack.targetEntity),
						),
					)
					attack.addNewAttack(newAttack)
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				totalReduction = 0
			},
		)
	},
}

export default Trapdoor
