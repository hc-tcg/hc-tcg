import {Background} from '../types'
import TransparentBackground from './transparent'

export const ALL_BACKGROUNDS: Background[] = [TransparentBackground]

export const BACKGROUNDS: Record<string | number, Background> =
	ALL_BACKGROUNDS.reduce(
		(result: Record<string | number, Background>, card) => {
			result[card.id] = card
			return result
		},
		{},
	)
