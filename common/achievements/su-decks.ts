import SplashPotionOfHarming from '../cards/advent-of-tcg/single-use/splash-potion-of-harming'
import CurseOfBinding from '../cards/single-use/curse-of-binding'
import CurseOfVanishing from '../cards/single-use/curse-of-vanishing'
import Efficiency from '../cards/single-use/efficiency'
import Fortune from '../cards/single-use/fortune'
import InvisibilityPotion from '../cards/single-use/invisibility-potion'
import Knockback from '../cards/single-use/knockback'
import Looting from '../cards/single-use/looting'
import Mending from '../cards/single-use/mending'
import PotionOfSlowness from '../cards/single-use/potion-of-slowness'
import PotionOfWeakness from '../cards/single-use/potion-of-weakness'
import {
	SplashPotionOfHealing,
	SplashPotionOfHealingII,
} from '../cards/single-use/splash-potion-of-healing'
import SplashPotionOfPoison from '../cards/single-use/splash-potion-of-poison'
import SweepingEdge from '../cards/single-use/sweeping-edge'
import {SingleUse} from '../cards/types'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const potions = [
	PotionOfSlowness,
	PotionOfWeakness,
	SplashPotionOfHarming,
	SplashPotionOfHealing,
	SplashPotionOfHealingII,
	SplashPotionOfPoison,
	InvisibilityPotion,
]

const books = [
	CurseOfBinding,
	CurseOfVanishing,
	Knockback,
	Looting,
	Efficiency,
	Fortune,
	Mending,
	SweepingEdge,
]

function getExclusiveSingleUseAchievement(
	name: string,
	numericId: number,
	typeName: string,
	allowed: SingleUse[],
) {
	const allowedIds = allowed.map((card) => card.id)

	const suAchievement: Achievement = {
		...achievement,
		numericId,
		id: typeName.replace(' ', '-').toLowerCase() + '-decks',
		progressionMethod: 'best',
		levels: [
			{
				name: name,
				description: `Win 5 games using a deck that includes ${typeName} single use cards, and no other types of single use cards.`,
				steps: 5,
			},
		],
		onGameStart(game, player, component, observer) {
			const playerDeck = game.components
				.filter(
					CardComponent,
					query.card.isSingleUse,
					query.card.player(player.entity),
				)
				.map((card) => card.props.id)

			const containsAtLeastOne = playerDeck.some((card) =>
				allowedIds.includes(card),
			)
			const containsNoOthers = playerDeck.every((card) =>
				allowedIds.includes(card),
			)
			if (!containsAtLeastOne || !containsNoOthers) return

			observer.subscribe(game.hooks.onGameEnd, (outcome) => {
				if (outcome.type !== 'player-won') return
				if (outcome.winner !== player.entity) return
				component.updateGoalProgress({goal: 0})
			})
		},
	}
	return suAchievement
}

export const PotionDecks = getExclusiveSingleUseAchievement(
	'Mega Brewery',
	66,
	'potion',
	potions,
)
export const BookDecks = getExclusiveSingleUseAchievement(
	'Lookie Lookie At My Bookie',
	67,
	'enchanted book',
	books,
)
