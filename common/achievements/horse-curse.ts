import {
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from '../cards/attach/armor'
import Emerald from '../cards/single-use/emerald'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HorseCurse: Achievement = {
	...achievement,
	numericId: 54,
	id: 'horse_curse',
	levels: [
		{
			name: 'Horse Curse',
			description:
				"KO a Hermit while your active Hermit is sleeping.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
	},
}

export default HorseCurse
