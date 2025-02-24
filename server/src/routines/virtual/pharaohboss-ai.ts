import PharaohRare from 'common/cards/advent-of-tcg/hermits/pharaoh-rare'
import {DiamondArmor, NetheriteArmor} from 'common/cards/attach/armor'
import Cubfan135Common from 'common/cards/hermits/cubfan135-common'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import SpeedrunnerItem from 'common/cards/items/speedrunner-common'
import GoldenApple from 'common/cards/single-use/golden-apple'
import {InstantHealth} from 'common/cards/single-use/instant-health'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {VirtualAI} from 'common/types/virtual-ai'
import {Clock} from 'three'

const PharaohBossAI: VirtualAI = {
	id: 'pharaoh_boss',
	getDeck(): Array<Card> {
		return [
			PharaohRare,
			PharaohRare,
			PharaohRare,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Rare,
			Cubfan135Rare,
			Cubfan135Rare,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			GoldenApple,
			Clock,
			NetheriteArmor,
			DiamondArmor,
			DiamondArmor,
			PotionOfWeakness,
			LavaBucket,
			InstantHealth,
		]
	},
	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}
export default PharaohBossAI
