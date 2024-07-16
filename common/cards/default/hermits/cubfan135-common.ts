import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Cubfan135Common extends Card {
	props: Hermit = {
		...hermit,
		id: 'cubfan135_common',
		numericId: 9,
		name: 'Cub',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'balanced',
		health: 290,
		primary: {
			name: 'Heyo',
			cost: ['balanced'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Vex Magic',
			cost: ['balanced', 'any'],
			damage: 70,
			power: null,
		},
	}
}

export default Cubfan135Common
