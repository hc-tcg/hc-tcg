import {hermit} from '../defaults'
import {Hermit} from '../types'

const HorseHeadHypnoCommon: Hermit = {
	...hermit,
	id: 'horseheadhypno_common',
	numericId: 805,
	name: 'Horse Head Hypno',
	shortName: 'H. H. Hypno',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	type: ['farm'],
	health: 260,
	primary: {
		name: 'I.O.U.',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Profit',
		cost: ['farm', 'farm', 'farm'],
		damage: 100,
		power: null,
	},
}

export default HorseHeadHypnoCommon
