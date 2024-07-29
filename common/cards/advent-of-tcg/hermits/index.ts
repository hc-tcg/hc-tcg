import DungeonTangoRare from './dungeontango-rare'
import PythonGBRare from './pythongb-rare'
import OrionSoundRare from './orionsound-rare'
import MonkeyfarmRare from './monkeyfarm-rare'
import SolidaritygamingRare from './solidaritygaming-rare'
import Smajor1995Rare from './smajor1995'
import Biffa2001Rare from './biffa2001-rare'
import PixlriffsRare from './pixlriffs-rare'
import LDShadowLadyRare from './ldshadowlady-rare'
import SmallishbeansRare from './smallishbeans-rare'
import BigBSt4tzRare from './bigbst4tz2-rare'
import ShubbleYTRare from './shubbleyt-rare'
import PharaohRare from './pharaoh-rare'
import GrianchRare from './grianch-rare'
import Card from '../../base/card'

const hermitCardClasses: Array<new () => Card> = [
	//Advent calendar cards
	MonkeyfarmRare,
	DungeonTangoRare,
	PythonGBRare,
	OrionSoundRare,
	SolidaritygamingRare,
	Smajor1995Rare,
	Biffa2001Rare,
	PixlriffsRare,
	ShubbleYTRare,
	LDShadowLadyRare,
	SmallishbeansRare,
	BigBSt4tzRare,
	PharaohRare,
	GrianchRare,
]

export default hermitCardClasses
