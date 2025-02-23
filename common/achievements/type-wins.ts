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
		levels: [
			{
				name: `${toTitleCase(type)} Adept`,
				description: `Win 10 games with at least 7 ${type} hermits in your deck`,
				steps: 10,
			},
			{
				name: `${toTitleCase(type)} Master`,
				description: `Win 100 games with at least 7 ${type} hermits in your deck`,
				steps: 100,
			},
		],
		icon: '',
		onGameEnd(_game, playerEntity, component, outcome) {
			console.log('Incrementing progress')
			if (outcome.type !== 'player-won' || outcome.winner !== playerEntity)
				return
			component.incrementGoalProgress({goal: 0})
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
export const AnyWins = getTypeWinAchievement(40, 'any')
