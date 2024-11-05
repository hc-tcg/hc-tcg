import {CardComponent, ObserverComponent} from '../../components'
import {ExpansionT} from '../../const/expansions'
import {GameModel} from '../../models/game-model'
import {CardRarityT, TokenCostT} from '../../types/cards'
import {beforeAttack} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

function getArmor(
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
		description: `When the Hermit this card is attached to takes damage, that damage is reduced by up to ${amount}hp each turn.`,
		onAttach(
			game: GameModel,
			component: CardComponent,
			observer: ObserverComponent,
		) {
			const {player, opponentPlayer} = component

			let damageBlocked = 0

			observer.subscribeWithPriority(
				game.hooks.beforeAttack,
				beforeAttack.EFFECT_REDUCE_DAMAGE,
				(attack) => {
					if (!attack.isTargeting(component) || attack.isType('status-effect'))
						return

					if (damageBlocked < amount) {
						const damageReduction = Math.min(
							attack.calculateDamage(),
							amount - damageBlocked,
						)
						damageBlocked += damageReduction
						attack.addDamageReduction(component.entity, damageReduction)
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
}

export const GoldArmor = getArmor(
	{
		id: 'gold_armor',
		numericId: 72,
		name: 'Gold Armour',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
	},
	10,
)

export const IronArmor = getArmor(
	{
		id: 'iron_armor',
		numericId: 78,
		name: 'Iron Armour',
		expansion: 'default',
		rarity: 'common',
		tokens: 2,
	},
	20,
)

export const DiamondArmor = getArmor(
	{
		id: 'diamond_armor',
		numericId: 65,
		name: 'Diamond Armour',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
	},
	30,
)

export const NetheriteArmor = getArmor(
	{
		id: 'netherite_armor',
		numericId: 87,
		name: 'Netherite Armour',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 4,
	},
	40,
)
