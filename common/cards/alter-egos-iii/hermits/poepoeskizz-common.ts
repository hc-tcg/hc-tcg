import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PoePoeSkizzCommon extends Card {
	props: Hermit = {
		...hermit,
		id: 'poepoeskizz_common',
		numericId: 166,
		name: 'Poe Poe Skizz',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		type: 'explorer',
		health: 300,
		primary: {
			name: 'Citation',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Pig Poo',
			cost: ['explorer', 'any'],
			damage: 70,
			power: null,
		},
	}
}

export default PoePoeSkizzCommon
