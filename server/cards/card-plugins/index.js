import registerSingleUseCards from './single-use'
import registerEffectCards from './effects'
import registerHermitCards from './hermits'

function registerCards(game) {
	registerSingleUseCards(game)
	registerEffectCards(game)
	registerHermitCards(game)
}

export default registerCards
