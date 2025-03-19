import {BACKGROUNDS} from './backgrounds'
import {BORDERS} from './borders'
import {COINS} from './coins'
import {HEARTS} from './hearts'
import {TITLES} from './titles'
import {Appearance} from './types'

export const defaultAppearance: Appearance = {
	title: TITLES['no_title'],
	coin: COINS['creeper'],
	heart: HEARTS['red'],
	background: BACKGROUNDS['transparent'],
	border: BORDERS['blue'],
}
