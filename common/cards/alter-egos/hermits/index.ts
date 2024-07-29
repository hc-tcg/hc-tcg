// common cards
import BeetlejhostCommon from './beetlejhost-common'
import EvilJevinCommon from './eviljevin-common'
import PoultryManCommon from './poultryman-common'
// rare & ultra rare cards
import LlamadadRare from './llamadad-rare'
import PotatoBoyRare from './potatoboy-rare'
import GoatfatherRare from './goatfather-rare'
import HotguyRare from './hotguy-rare'
import JinglerRare from './jingler-rare'
import EvilXisumaRare from './evilxisuma_rare'
import HelsknightRare from './helsknight-rare'
import RenbobRare from './renbob-rare'
import HumanCleoRare from './humancleo-rare'
import {CardClass} from '../../base/card'

const hermitCardClasses: Array<CardClass> = [
	// AE Cards
	BeetlejhostCommon,
	EvilJevinCommon,
	EvilXisumaRare,
	GoatfatherRare,
	HelsknightRare,
	HotguyRare,
	HumanCleoRare,
	JinglerRare,
	LlamadadRare,
	PotatoBoyRare,
	PoultryManCommon,
	RenbobRare,
]

export default hermitCardClasses
