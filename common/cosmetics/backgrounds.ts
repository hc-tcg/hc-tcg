import AllCards from '../achievements/jack-of-all-cards'
import {Background} from './types'

const BackgroundDefinitions: Omit<Background, 'type'>[] = [
	{
		id: 'transparent',
		name: 'Transparent',
	},
	{
		id: 'old_menu',
		name: 'Old Menu',
		requires: AllCards.id,
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
