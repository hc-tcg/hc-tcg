import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const CyberpunkImpulseCommon: Hermit = {
	...hermit,
	id: 'cyberpunkimpulse_common',
	numericId: 257,
	name: 'Cyberpunk Impulse',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'speedrunner',
	health: 280,
	primary: {
		name: "Bop 'N' Go",
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Electrify',
		cost: ['speedrunner', 'speedrunner'],
		damage: 80,
		power: null,
	},
}

export default CyberpunkImpulseCommon
