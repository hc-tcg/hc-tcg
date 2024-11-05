import {CardComponent, ObserverComponent} from '../../components'
import {ExpansionT} from '../../const/expansions'
import {GameModel} from '../../models/game-model'
import {CardRarityT, TokenCostT} from '../../types/cards'
import {beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

function getSword(
	props: {
		id: string
		name: string
		rarity: CardRarityT
		numericId: number
		tokens: TokenCostT
		expansion: ExpansionT
	},
	amount: number,
): SingleUse {
	return {
		...singleUse,
		id: props.id,
		numericId: props.numericId,
		name: props.name,
		expansion: props.expansion,
		rarity: props.rarity,
		tokens: props.tokens,
		description: `Do ${amount}hp damage to your opponent's active Hermit.`,
		hasAttack: true,
		attackPreview: (_game) => `$A${amount}$`,
		onAttach(
			game: GameModel,
			component: CardComponent,
			observer: ObserverComponent,
		) {
			const {player, opponentPlayer} = component

			observer.subscribe(player.hooks.getAttack, () => {
				const swordAttack = game
					.newAttack({
						attacker: component.entity,
						player: player.entity,
						target: opponentPlayer.activeRowEntity,
						type: 'effect',
						log: (values) =>
							`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
					})
					.addDamage(component.entity, amount)

				return swordAttack
			})

			observer.subscribeWithPriority(
				game.hooks.beforeAttack,
				beforeAttack.APPLY_SINGLE_USE_ATTACK,
				(attack) => {
					if (!attack.isAttacker(component.entity)) return
					applySingleUse(game)
					observer.unsubscribeFromEverything()
				},
			)
		},
	}
}
export const IronSword = getSword(
	{
		id: 'iron_sword',
		numericId: 79,
		name: 'Iron Sword',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
	},
	20,
)

export const DiamondSword = getSword(
	{
		id: 'diamond_sword',
		numericId: 66,
		name: 'Diamond Sword',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
	},
	40,
)

export const NetheriteSword = getSword(
	{
		id: 'netherite_sword',
		numericId: 88,
		name: 'Netherite Sword',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 3,
	},
	60,
)
