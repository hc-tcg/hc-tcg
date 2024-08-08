import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class InstantHealthII extends CardOld {
	pickCondition = query.every(query.slot.hermit, query.not(query.slot.empty))

	props: SingleUse = {
		...singleUse,
		id: 'instant_health_ii',
		numericId: 43,
		name: 'Instant Health II',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description: 'Heal one of your Hermits 60hp.',
		attachCondition: query.every(
			singleUse.attachCondition,
			query.slot.playerHasActiveHermit,
			query.exists(SlotComponent, this.pickCondition),
		),
		log: (values) =>
			`${values.defaultLog} on $p${values.pick.name}$ and healed $g60hp$`,
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an active or AFK Hermit',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard()) return
				// Apply
				pickedSlot.row?.heal(60)
				applySingleUse(game, pickedSlot)
			},
		})
	}
}

export default InstantHealthII
