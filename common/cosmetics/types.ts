import {Achievement} from '../achievements/types'

export type Cosmetic = {
	type: 'title' | 'coin' | 'heart' | 'background' | 'border'
	id: string
	name: string
	requires?: Achievement['id']
}

export type Coin = Cosmetic & {
	type: 'coin'
	borderColor: string
}
