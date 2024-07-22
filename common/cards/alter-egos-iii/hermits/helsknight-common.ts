import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class HelsknightCommon extends Card {
	props: Hermit = {
		...hermit,
		id: 'helsknight_common',
		numericId: 157,
		name: 'Helsknight',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		type: 'miner',
		health: 290,
		primary: {
			name: 'Slash',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Diabolical',
			cost: ['miner', 'miner'],
			damage: 80,
			power: null,
		},
	}
}

export default HelsknightCommon
