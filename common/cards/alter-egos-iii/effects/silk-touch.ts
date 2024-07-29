import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import * as query from '../../../components/query'

class SilkTouch extends Card {
	props: Attach = {
		...attach,
		id: 'silk_touch',
		numericId: 189,
		name: 'Silk Touch',
		expansion: 'alter_egos_iii',
		rarity: 'rare',
		tokens: 0,
		description:
			'Attach to your active Hermit. If a single use effect card is used while this card is attached to your active Hermit, discard this card instead and shuffle the single use effect card back into your deck.\nThis card can not be returned to your hand from your discard pile.',
	}

	public override onCreate(game: GameModel, component: CardComponent) {
		component.canBeRecovered = false
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {})
	}
}

export default SilkTouch
