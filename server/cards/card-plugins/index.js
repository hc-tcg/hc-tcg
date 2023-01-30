import registerSingleUseCards from './single-use'
import registerEffectCards from './effects'
import registerHermitCards from './hermits'

function registerCards(game) {
	registerHermitCards(game)
	registerSingleUseCards(game)
	registerEffectCards(game)
}

export default registerCards
