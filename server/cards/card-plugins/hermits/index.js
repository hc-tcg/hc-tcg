import BdoubleO100RareHermitCard from './bdoubleo100-rare'
import Cubfan135RareHermitCard from './cubfan135-rare'

function registerCards(game) {
	new BdoubleO100RareHermitCard().register(game)
	new Cubfan135RareHermitCard().register(game)
}

export default registerCards
