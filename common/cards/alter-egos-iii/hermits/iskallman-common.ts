import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class IskallManCommon extends Card {
	props: Hermit = {
		...hermit,
		id: 'iskallman_common',
		numericId: 183,
		name: 'IskallMAN',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'common',
		tokens: 1,
		type: 'farm',
		health: 260,
		primary: {
			name: 'Troll',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Diamond Rain',
			cost: ['farm', 'farm', 'farm'],
			damage: 100,
			power: null,
		},
	}
}

export default IskallManCommon
