import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import query from '../../../components/query'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {SingleUse} from '../../base/types'

class InstantHealth extends Card {
	pickCondition = query.every(query.slot.hermit, query.not(query.slot.empty))

	props: SingleUse = {
		...singleUse,
		id: 'instant_health',
		numericId: 42,
		name: 'Instant Health',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description: 'Heal one of your Hermits 30hp.',
		attachCondition: query.every(
			singleUse.attachCondition,
			query.slot.playerHasActiveHermit,
			query.exists(SlotComponent, this.pickCondition)
		),
		log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g30hp$`,
	}

	override onAttach(game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: 'Pick an active or AFK Hermit',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard()) return
				// Apply
				pickedSlot.row?.heal(30)
				applySingleUse(game, pickedSlot)
			},
		})
	}
}

export default InstantHealth
