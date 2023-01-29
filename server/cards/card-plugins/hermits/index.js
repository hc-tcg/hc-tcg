import BdoubleO100RareHermitCard from './bdoubleo100-rare'
import Cubfan135RareHermitCard from './cubfan135-rare'
import Docm77RareHermitCard from './docm77-rare'

function registerCards(game) {
	new BdoubleO100RareHermitCard().register(game)
	new Cubfan135RareHermitCard().register(game)
	new Docm77RareHermitCard().register(game)
}

export default registerCards
