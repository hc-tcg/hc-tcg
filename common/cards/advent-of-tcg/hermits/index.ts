import DungeonTangoRareHermitCard from './dungeontango-rare'
import PythonGBRareHermitCard from './pythongb-rare'
import OrionSoundRareHermitCard from './orionsound-rare'
import MonkeyfarmRareHermitCard from './monkeyfarm-rare'
import SolidaritygamingRareHermitCard from './solidaritygaming-rare'
import Smajor1995RareHermitCard from './smajor1995'
import Biffa2001RareHermitCard from './biffa2001-rare'
import PixlriffsRareHermitCard from './pixlriffs-rare'
import LDShadowLadyRareHermitCard from './ldshadowlady-rare'
import SmallishbeansRareHermitCard from './smallishbeans-rare'
import BigBSt4tzRareHermitCard from './bigbst4tz2-rare'
import ShubbleYTRareHermitCard from './shubbleyt-rare'
import PharaohRareHermitCard from './pharaoh-rare'
import GrianchRareHermitCard from './grianch-rare'
import Card from '../../base/card'

const hermitCardClasses: Array<new () => Card> = [
	//Advent calendar cards
	MonkeyfarmRareHermitCard,
	DungeonTangoRareHermitCard,
	PythonGBRareHermitCard,
	OrionSoundRareHermitCard,
	SolidaritygamingRareHermitCard,
	Smajor1995RareHermitCard,
	Biffa2001RareHermitCard,
	PixlriffsRareHermitCard,
	ShubbleYTRareHermitCard,
	LDShadowLadyRareHermitCard,
	SmallishbeansRareHermitCard,
	BigBSt4tzRareHermitCard,
	PharaohRareHermitCard,
	GrianchRareHermitCard,
]

export default hermitCardClasses
