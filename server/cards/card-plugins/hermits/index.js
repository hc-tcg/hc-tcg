import BdoubleO100RareHermitCard from './bdoubleo100-rare'
import Cubfan135RareHermitCard from './cubfan135-rare'
import Docm77RareHermitCard from './docm77-rare'
import EthosLabRareHermitCard from './ethoslab-rare'
import EthosLabUltraRareHermitCard from './ethoslab-ultra-rare'
import FalseSymmetryRareHermitCard from './falsesymmetry-rare'

function registerCards(game) {
	new BdoubleO100RareHermitCard().register(game)
	new Cubfan135RareHermitCard().register(game)
	new Docm77RareHermitCard().register(game)
	new EthosLabRareHermitCard().register(game)
	new EthosLabUltraRareHermitCard().register(game)
	new FalseSymmetryRareHermitCard().register(game)
}

export default registerCards
