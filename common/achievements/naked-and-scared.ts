import BrewingStand from '../cards/advent-of-tcg/attach/brewing-stand'
import SculkCatalyst from '../cards/advent-of-tcg/attach/sculk-catalyst'
import {
	ChainmailArmor,
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from '../cards/attach/armor'
import GoldenApple from '../cards/single-use/golden-apple'
import {
	InstantHealth,
	InstantHealthII,
} from '../cards/single-use/instant-health'
import {
	SplashPotionOfHealing,
	SplashPotionOfHealingII,
} from '../cards/single-use/splash-potion-of-healing'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const bannedCards: string[] = [
	InstantHealth,
	InstantHealthII,
	SplashPotionOfHealing,
	SplashPotionOfHealingII,
	GoldenApple,
	BrewingStand,
	SculkCatalyst,
	GoldArmor,
	IronArmor,
	DiamondArmor,
	ChainmailArmor,
	NetheriteArmor,
].map((card) => card.id)

const NakedAndScared: Achievement = {
	...achievement,
	numericId: 15,
	progressionMethod: 'sum',
	id: 'naked_and_scared',
	levels: [
		{
			name: 'Naked and Scared',
			description: 'Win 15 games using no healing or armor cards.',
			steps: 15,
		},
	],
	onGameStart(game, player, component, observer) {
		let deckHasBannedCards = game.components.exists(
			CardComponent,
			query.card.player(player.entity),
			(_game, card) => bannedCards.includes(card.props.id),
		)
		if (deckHasBannedCards) return

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type === 'player-won' && outcome.winner === player.entity) {
				component.updateGoalProgress({goal: 0})
			}
		})
	},
}

export default NakedAndScared
