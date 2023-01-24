import registerSingleUseCards from './single-use'
import registerEffectCards from './effects'

function registerCards(game) {
	registerSingleUseCards(game)
	registerEffectCards(game)
}

export default registerCards
