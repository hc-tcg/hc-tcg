import {CardComponent} from '../components'
import query from '../components/query'
import {TypeT} from '../types/cards'
import {achievement} from './defaults'
import {Achievement} from './types'

function toTitleCase(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

function getTypeWinAchievement(id: number, type: TypeT): Achievement {
	return {
		...achievement,
		numericId: id,
		id: `${type.toLowerCase()}-wins`,
		progressionMethod: 'sum',
		levels: [
			{
				name: `${toTitleCase(type)} Apprentice`,
				description: `Win 20 games with at least 7 ${type} hermits in your deck.`,
				steps: 20,
			},
			{
				name: `${toTitleCase(type)} Master`,
				description: `Win 75 games with at least 7 ${type} hermits in your deck.`,
				steps: 75,
			},
		],
		onGameStart(game, player, component, observer) {
			if (
				game.components.filter(
					CardComponent,
					query.card.player(player.entity),
					query.card.type(type),
				).length < 7
			) {
				return
			}

			observer.subscribe(game.hooks.onGameEnd, (outcome) => {
				if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
					return
				component.updateGoalProgress({goal: 0})
			})
		},
	}
}

export const BalancedWins = getTypeWinAchievement(30, 'balanced')
export const BuilderWins = getTypeWinAchievement(31, 'builder')
export const SpeedrunnerWins = getTypeWinAchievement(32, 'speedrunner')
export const RedstoneWins = getTypeWinAchievement(33, 'redstone')
export const FarmWins = getTypeWinAchievement(34, 'farm')
export const PvpWins = getTypeWinAchievement(35, 'pvp')
export const TerraformWins = getTypeWinAchievement(36, 'terraform')
export const PranksterWins = getTypeWinAchievement(37, 'prankster')
export const MinerWins = getTypeWinAchievement(38, 'miner')
export const ExplorerWins = getTypeWinAchievement(39, 'explorer')
