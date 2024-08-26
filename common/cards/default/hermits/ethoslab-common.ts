import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const EthosLabCommon: Hermit = {
	...hermit,
	id: 'ethoslab_common',
	numericId: 19,
	name: 'Etho',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	type: 'balanced',
	health: 260,
	primary: {
		name: 'Snack Time',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Breach',
		cost: ['balanced', 'balanced', 'balanced'],
		damage: 100,
		power: null,
	},
}

export default EthosLabCommon
