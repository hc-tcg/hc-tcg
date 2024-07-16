// common cards
import BeetlejhostCommonHermitCard from './beetlejhost-common'
import EvilJevinCommonHermitCard from './eviljevin-common'
import PoultrymanCommonHermitCard from './poultryman-common'
// rare & ultra rare cards
import LlamadadRareHermitCard from './llamadad-rare'
import PotatoBoyRareHermitCard from './potatoboy-rare'
import GoatfatherRareHermitCard from './goatfather-rare'
import HotguyRareHermitCard from './hotguy-rare'
import JinglerRareHermitCard from './jingler-rare'
import EvilXisumaRareHermitCard from './evilxisuma_rare'
import HelsknightRareHermitCard from './helsknight-rare'
import RenbobRareHermitCard from './renbob-rare'
import HumanCleoRareHermitCard from './humancleo-rare'
import Card from '../../base/card'

const hermitCardClasses: Array<new () => Card> = [
	// AE Cards
	BeetlejhostCommonHermitCard,
	EvilJevinCommonHermitCard,
	EvilXisumaRareHermitCard,
	GoatfatherRareHermitCard,
	HelsknightRareHermitCard,
	HotguyRareHermitCard,
	HumanCleoRareHermitCard,
	JinglerRareHermitCard,
	LlamadadRareHermitCard,
	PotatoBoyRareHermitCard,
	PoultrymanCommonHermitCard,
	RenbobRareHermitCard,
]

export default hermitCardClasses
