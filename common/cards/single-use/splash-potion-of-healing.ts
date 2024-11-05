import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {ExpansionT} from '../../const/expansions'
import {GameModel} from '../../models/game-model'
import {CardRarityT, TokenCostT} from '../../types/cards'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

function getSplashPotionOfHealing(
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
		description: `Heal all of your Hermits ${amount}hp.`,
		showConfirmationModal: true,
		log: (values) =>
			`${values.defaultLog} and healed all {your|their} Hermits $g${amount}hp$`,
		onAttach(
			game: GameModel,
			component: CardComponent,
			observer: ObserverComponent,
		) {
			const {player} = component

			observer.subscribe(player.hooks.onApply, () =>
				game.components
					.filter(RowComponent, query.row.player(player?.entity))
					.forEach((row) => row.heal(amount)),
			)
		},
	}
}

export const SplashPotionOfHealing = getSplashPotionOfHealing(
	{
		id: 'splash_potion_of_healing',
		name: 'Splash Potion of Healing',
		rarity: 'common',
		tokens: 0,
		numericId: 90,
		expansion: 'default',
	},
	20,
)

export const SplashPotionOfHealingII = getSplashPotionOfHealing(
	{
		id: 'splash_potion_of_healing_ii',
		name: 'Splash Potion of Healing II',
		rarity: 'rare',
		tokens: 1,
		numericId: 121,
		expansion: 'alter_egos',
	},
	30,
)
