import HowDidWeGetHere from '../achievements/how-did-we-get-here'
import AllCards from '../achievements/jack-of-all-cards'
import {Background} from './types'

const BackgroundDefinitions: Omit<Background, 'type'>[] = [
	{
		id: 'transparent',
		name: 'Default',
	},
	{
		id: 'classic',
		name: 'Classic',
		requires: AllCards.id,
	},
	{
		id: 'how_did_we_get_here',
		name: 'The Nether',
		requires: HowDidWeGetHere.id,
	},
	{
		id: 'terraform',
		name: 'Azalea',
	},
	{
		id: 'prankster',
		name: 'Deep Dark',
	},
	{
		id: 'redstone',
		name: 'Desert',
	},
	{
		id: 'miner',
		name: 'Dripstone',
	},
	{
		id: 'explorer',
		name: 'The End',
	},
	{
		id: 'farm',
		name: 'Farm',
	},
	{
		id: 'balanced',
		name: 'Flowers',
	},
	{
		id: 'builder',
		name: 'Plains',
	},
	{
		id: 'speedrunner',
		name: 'Stronghold',
	},
	{
		id: 'pvp',
		name: 'Taiga',
	},
]

export const ALL_BACKGROUNDS: Background[] = BackgroundDefinitions.map(
	(background) => ({type: 'background', ...background}),
)

export const BACKGROUNDS: Record<string | number, Background> =
	ALL_BACKGROUNDS.reduce(
		(result: Record<string | number, Background>, card) => {
			result[card.id] = card
			return result
		},
		{},
	)
