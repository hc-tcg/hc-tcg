import HowDidWeGetHere from '../achievements/how-did-we-get-here'
import AllCards from '../achievements/jack-of-all-cards'
import {Background} from './types'

const BackgroundDefinitions: Omit<Background, 'type'>[] = [
	{
		id: 'transparent',
		name: 'Transparent',
	},
	{
		id: 'old_menu',
		name: 'Pixels',
		requires: AllCards.id,
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
		id: 'explorer',
		name: 'The End',
	},
	{
		id: 'farm',
		name: 'Farm',
	},
	{
		id: 'terraform',
		name: 'Azalea',
	},
	{
		id: 'pvp',
		name: 'Taiga',
	},
	{
		id: 'speedrunner',
		name: 'Stronghold',
	},
	{
		id: 'miner',
		name: 'Dripstone',
	},
	{
		id: 'redstone',
		name: 'Desert',
	},
	{
		id: 'prankster',
		name: 'Deep Dark',
	},
	{
		id: 'how_did_we_get_here',
		name: 'The Nether',
		requires: HowDidWeGetHere.id,
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
