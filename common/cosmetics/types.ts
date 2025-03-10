import {Achievement} from '../achievements/types'

export type Cosmetic = {
	type: 'title' | 'coin' | 'heart' | 'background' | 'border'
	id: string
	name: string
	requires?: {achievement: Achievement['id']; level?: number}
}

export type Title = Cosmetic & {type: 'title'}

export type Coin = Cosmetic & {
	type: 'coin'
	borderColor: string
}

export type Heart = Cosmetic & {type: 'heart'; offVariantName?: string}

export type Background = Cosmetic & {type: 'background'; preview?: string}

export type Border = Cosmetic & {type: 'border'}

export type Appearance = {
	title: Title
	coin: Coin
	heart: Heart
	background: Background
	border: Border
}
