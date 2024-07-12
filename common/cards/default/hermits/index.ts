// common cards
import BdoubleO100CommonHermitCard from './bdoubleo100-common'
import Cubfan135CommonHermitCard from './cubfan135-common'
import Docm77CommonHermitCard from './docm77-common'
import EthosLabCommonHermitCard from './ethoslab-common'
import FalseSymmetryCommonHermitCard from './falsesymmetry-common'
import GeminiTayCommonHermitCard from './geminitay-common'
import GrianCommonHermitCard from './grian-common'
import GoodTimesWithScarCommonHermitCard from './goodtimeswithscar-common'
import HypnotizdCommonHermitCard from './hypnotizd-common'
import IJevinCommonHermitCard from './ijevin-common'
import ImpulseSVCommonHermitCard from './impulsesv-common'
import Iskall85CommonHermitCard from './iskall85-common'
import JoeHillsCommonHermitCard from './joehills-common'
import KeralisCommonHermitCard from './keralis-common'
import MumboJumboCommonHermitCard from './mumbojumbo-common'
import PearlescentMoonCommonHermitCard from './pearlescentmoon-common'
import RendogCommonHermitCard from './rendog-common'
import StressMonster101CommonHermitCard from './stressmonster101-common'
import TangoTekCommonHermitCard from './tangotek-common'
import TinFoilChefCommonHermitCard from './tinfoilchef-common'
import VintageBeefCommonHermitCard from './vintagebeef-common'
import WelsknightCommonHermitCard from './welsknight-common'
import XBCraftedCommonHermitCard from './xbcrafted-common'
import XisumavoidCommonHermitCard from './xisumavoid-common'
import ZedaphPlaysCommonHermitCard from './zedaphplays-common'
import ZombieCleoCommonHermitCard from './zombiecleo-common'
// rare & ultra rare cards
import BdoubleO100RareHermitCard from './bdoubleo100-rare'
import Cubfan135RareHermitCard from './cubfan135-rare'
import Docm77RareHermitCard from './docm77-rare'
import DreamRareHermitCard from './dream-rare'
import EthosLabRareHermitCard from './ethoslab-rare'
import EthosLabUltraRareHermitCard from './ethoslab-ultra-rare'
import FalseSymmetryRareHermitCard from './falsesymmetry-rare'
import GeminiTayRareHermitCard from './geminitay-rare'
import GrianRareHermitCard from './grian-rare'
import GoodTimesWithScarRareHermitCard from './goodtimeswithscar-rare'
import HypnotizdRareHermitCard from './hypnotizd-rare'
import IJevinRareHermitCard from './ijevin-rare'
import ImpulseSVRareHermitCard from './impulsesv-rare'
import Iskall85RareHermitCard from './iskall85-rare'
import JoeHillsRareHermitCard from './joehills-rare'
import KeralisRareHermitCard from './keralis-rare'
import MumboJumboRareHermitCard from './mumbojumbo-rare'
import PearlescentMoonRareHermitCard from './pearlescentmoon-rare'
import RendogRareHermitCard from './rendog-rare'
import StressMonster101RareHermitCard from './stressmonster101-rare'
import TangoTekRareHermitCard from './tangotek-rare'
import TinFoilChefRareHermitCard from './tinfoilchef-rare'
import TinFoilChefUltraRareHermitCard from './tinfoilchef-ultra-rare'
import VintageBeefRareHermitCard from './vintagebeef-rare'
import VintageBeefUltraRareHermitCard from './vintagebeef-ultra-rare'
import WelsknightRareHermitCard from './welsknight-rare'
import XBCraftedRareHermitCard from './xbcrafted-rare'
import XisumavoidRareHermitCard from './xisumavoid-rare'
import ZedaphPlaysRareHermitCard from './zedaphplays-rare'
import ZombieCleoRareHermitCard from './zombiecleo-rare'
import Card from '../../base/card'

const hermitCardClasses: Array<new () => Card> = [
	BdoubleO100CommonHermitCard,
	BdoubleO100RareHermitCard,
	Cubfan135CommonHermitCard,
	Cubfan135RareHermitCard,
	Docm77CommonHermitCard,
	Docm77RareHermitCard,
	DreamRareHermitCard,
	EthosLabCommonHermitCard,
	EthosLabRareHermitCard,
	EthosLabUltraRareHermitCard,
	FalseSymmetryCommonHermitCard,
	FalseSymmetryRareHermitCard,
	GeminiTayCommonHermitCard,
	GeminiTayRareHermitCard,
	GrianCommonHermitCard,
	GrianRareHermitCard,
	GoodTimesWithScarCommonHermitCard,
	GoodTimesWithScarRareHermitCard,
	HypnotizdCommonHermitCard,
	HypnotizdRareHermitCard,
	IJevinCommonHermitCard,
	IJevinRareHermitCard,
	ImpulseSVCommonHermitCard,
	ImpulseSVRareHermitCard,
	Iskall85CommonHermitCard,
	Iskall85RareHermitCard,
	JoeHillsCommonHermitCard,
	JoeHillsRareHermitCard,
	KeralisCommonHermitCard,
	KeralisRareHermitCard,
	MumboJumboCommonHermitCard,
	MumboJumboRareHermitCard,
	PearlescentMoonCommonHermitCard,
	PearlescentMoonRareHermitCard,
	RendogCommonHermitCard,
	RendogRareHermitCard,
	StressMonster101CommonHermitCard,
	StressMonster101RareHermitCard,
	TangoTekCommonHermitCard,
	TangoTekRareHermitCard,
	TinFoilChefCommonHermitCard,
	TinFoilChefRareHermitCard,
	TinFoilChefUltraRareHermitCard,
	VintageBeefCommonHermitCard,
	VintageBeefRareHermitCard,
	VintageBeefUltraRareHermitCard,
	WelsknightCommonHermitCard,
	WelsknightRareHermitCard,
	XBCraftedCommonHermitCard,
	XBCraftedRareHermitCard,
	XisumavoidCommonHermitCard,
	XisumavoidRareHermitCard,
	ZedaphPlaysCommonHermitCard,
	ZedaphPlaysRareHermitCard,
	ZombieCleoCommonHermitCard,
	ZombieCleoRareHermitCard,
]

export default hermitCardClasses
