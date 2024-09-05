import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeDefence} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const DiamondBoots: Attach = {
	...attach,
	id: 'diamond_boots',
	numericId: 186,
	name: 'Diamond Boots',
	expansion: 'alter_egos_iii',
	rarity: 'rare',
	tokens: 1,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 10hp each turn. Opponent can not make this Hermit go AFK.',
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		observer.subscribe(player.hooks.getImmuneToKnockback, () => {
			return (
				component.slot.inRow() &&
				component.slot.rowEntity == player.activeRowEntity
			)
		})

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.EFFECT_BLOCK_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(component) || attack.isType('status-effect'))
					return

				if (attack.attacker instanceof CardComponent) {
					if (attack.attacker.isSingleUse() || attack.attacker.isAttach()) {
						attack
							.multiplyDamage(component.entity, 0)
							.lockDamage(component.entity)
					}
				}

				if (damageBlocked < 10) {
					const damageReduction = Math.min(
						attack.calculateDamage(),
						10 - damageBlocked,
					)
					damageBlocked += damageReduction
					attack.reduceDamage(component.entity, damageReduction)
				}
			},
		)

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		observer.subscribe(player.hooks.onTurnStart, resetCounter)
		observer.subscribe(opponentPlayer.hooks.onTurnStart, resetCounter)
	},
}

export default DiamondBoots
