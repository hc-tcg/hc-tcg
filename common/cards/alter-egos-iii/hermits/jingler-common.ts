import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class JinglerCommon extends Card {
	props: Hermit = {
		...hermit,
		id: 'jingler_common',
		numericId: 181,
		name: 'Jingler',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		type: 'redstone',
		health: 300,
		primary: {
			name: 'Pranked',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Misdirection',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: null,
		},
	}
}

export default JinglerCommon
