import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {ExpansionT} from '../../const/expansions'
import {GameModel} from '../../models/game-model'
import {CardRarityT, TokenCostT} from '../../types/cards'
import {beforeAttack, onTurnEnd} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'
import {DiamondArmor, GoldArmor, IronArmor, NetheriteArmor} from './armor'

function getThorns(
	props: {
		id: string
		name: string
		rarity: CardRarityT
		numericId: number
		tokens: TokenCostT
		expansion: ExpansionT
	},
	amount: number,
): Attach {
	return {
		...attach,
		id: props.id,
		numericId: props.numericId,
		name: props.name,
		expansion: props.expansion,
		rarity: props.rarity,
		tokens: props.tokens,
		description: `When the Hermit this card is attached to takes damage, your opponent's active Hermit takes ${amount}hp damage.\nIgnores armour.`,
		onAttach(
			game: GameModel,
			component: CardComponent,
			observer: ObserverComponent,
		) {
			const {opponentPlayer} = component
			let hasTriggered = false

			observer.subscribeWithPriority(
				game.hooks.beforeAttack,
				beforeAttack.REACT_TO_DAMAGE,
				(attack) => {
					// If we have already triggered once this turn do not do so again
					if (hasTriggered) return
					if (!component.slot.inRow()) return
					// Only when the opponent attacks us
					if (
						!attack.isTargeting(component) ||
						attack.player !== opponentPlayer
					)
						return

					if (attack.isType('status-effect') || attack.isBacklash) return
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
						.addDamage(component.entity, amount)

					backlashAttack.shouldIgnoreCards.push(
						query.card.is(GoldArmor, IronArmor, DiamondArmor, NetheriteArmor),
					)

					attack.addNewAttack(backlashAttack)
				},
			)

			observer.subscribeWithPriority(
				opponentPlayer.hooks.onTurnEnd,
				onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
				() => {
					hasTriggered = false
				},
			)
		},
	}
}

export const Thorns = getThorns(
	{
		id: 'thorns',
		numericId: 96,
		name: 'Thorns',
		expansion: 'default',
		rarity: 'common',
		tokens: 2,
	},
	20,
)

export const ThornsII = getThorns(
	{
		id: 'thorns_ii',
		numericId: 123,
		name: 'Thorns II',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 3,
	},
	30,
)

export const ThornsIII = getThorns(
	{
		id: 'thorns_iii',
		numericId: 124,
		name: 'Thorns III',
		expansion: 'alter_egos',
		rarity: 'ultra_rare',
		tokens: 4,
	},
	40,
)
