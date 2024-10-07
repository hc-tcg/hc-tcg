import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const BdoubleO100Common: Hermit = {
	...hermit,
	id: 'bdoubleo100_common',
	numericId: 0,
	name: 'Bdubs',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'builder',
	health: 260,
	primary: {
		name: 'Gradient',
		cost: ['builder'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Prettystone',
		cost: ['builder', 'builder'],
		damage: 80,
		power: null,
	},
}

export default BdoubleO100Common
