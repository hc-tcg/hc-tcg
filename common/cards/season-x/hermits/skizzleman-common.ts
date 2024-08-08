import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class SkizzlemanCommon extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'skizzleman_common',
		numericId: 171,
		name: 'Skizz',
		expansion: 'season_x',
		rarity: 'common',
		tokens: 0,
		type: 'explorer',
		health: 280,
		primary: {
			name: 'Laugh Attack ',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Bear Hug',
			cost: ['explorer', 'explorer', 'any'],
			damage: 90,
			power: null,
		},
	}
}

export default SkizzlemanCommon
