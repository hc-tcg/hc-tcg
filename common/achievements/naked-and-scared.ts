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
	id: 'naked_and_scared',
	levels: [
		{
			name: 'Naked and Scared',
			description: 'Win 15 games using no healing or armor cards.',
			steps: 15,
			icon: 'naked_and_scared',
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let usedBannedCard = false

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (!bannedCards.includes(card.props.id)) return
			usedBannedCard = true
		})

		observer.subscribe(game.hooks.onGameEnd, () => {
			if (usedBannedCard) return
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default NakedAndScared
