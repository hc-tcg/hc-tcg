import PharaohRare from 'common/cards/advent-of-tcg/hermits/pharaoh-rare'
import {DiamondArmor, NetheriteArmor} from 'common/cards/attach/armor'
import TurtleShell from 'common/cards/attach/turtle-shell'
import Cubfan135Common from 'common/cards/hermits/cubfan135-common'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import SpeedrunnerItem from 'common/cards/items/speedrunner-common'
import SpeedrunnerDoubleItem from 'common/cards/items/speedrunner-rare'
import Clock from 'common/cards/single-use/clock'
import GoldenApple from 'common/cards/single-use/golden-apple'
import {InstantHealthII} from 'common/cards/single-use/instant-health'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {Card} from 'common/cards/types'
import {AIComponent} from 'common/components/ai-component'
import {GameModel} from 'common/models/game-model'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): Array<AnyTurnActionData> {}

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
			BalancedDoubleItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			GoldenApple,
			Clock,
			NetheriteArmor,
			DiamondArmor,
			DiamondArmor,
			PotionOfWeakness,
			LavaBucket,
			InstantHealthII,
			InstantHealthII,
			TurtleShell,
			TurtleShell,
		]
	},
	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}
export default PharaohBossAI
