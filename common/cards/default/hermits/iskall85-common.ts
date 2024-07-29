import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Iskall85Common extends Card {
	props: Hermit = {
		...hermit,
		id: 'iskall85_common',
		numericId: 47,
		name: 'Iskall',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		type: 'balanced',
		health: 280,
		primary: {
			name: 'Hallo',
			cost: ['balanced'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Omega',
			cost: ['balanced', 'balanced', 'balanced'],
			damage: 100,
			power: null,
		},
	}
}

export default Iskall85Common
