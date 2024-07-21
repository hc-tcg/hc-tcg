import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import * as query from '../../../components/query'
import BadOmenEffect from '../../../status-effects/badomen'

class BadOmen extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'bad_omen',
		numericId: 139,
		name: 'Bad Omen',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		description: `Give your opponent's active Hermit bad omen for their next 3 turns.`,
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'badomen',
			},
		],
		attachCondition: query.every(singleUse.attachCondition, query.slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		// BadOmenEffect must be applied before TrapHoleEffect flips a coin
		observer.subscribeBefore(player.hooks.onApply, () => {
			let target = game.components.findEntity(
				CardComponent,
				query.card.opponentPlayer,
				query.card.isHermit,
				query.card.row(query.row.active)
			)
			if (!target) return
			game.components.new(StatusEffectComponent, BadOmenEffect).apply(target)
		})
	}
}

export default BadOmen
