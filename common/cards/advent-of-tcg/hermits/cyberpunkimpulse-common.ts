import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const CyberpunkImpulseCommon: Hermit = {
	...hermit,
	id: 'cyberpunkimpulse_common',
	numericId: 1406,
	name: 'Cyberpunk Impulse',
	shortName: 'C. Impulse',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'common',
	tokens: 0,
	type: ['speedrunner'],
	health: 280,
	primary: {
		name: 'Station',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Mayhem',
		cost: ['speedrunner', 'speedrunner'],
		damage: 80,
		power: null,
	},
}

export default CyberpunkImpulseCommon
