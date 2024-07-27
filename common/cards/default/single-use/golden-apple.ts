import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import query from '../../../components/query'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {SingleUse} from '../../base/types'

class GoldenApple extends Card {
	pickCondition = query.every(
		query.slot.hermit,
		query.not(query.slot.active),
		query.not(query.slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'golden_apple',
		numericId: 30,
		name: 'Golden Apple',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 3,
		description: 'Heal one of your AFK Hermits 100hp.',
		log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g100hp$`,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.slot.playerHasActiveHermit,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: 'Pick one of your AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard()) throw new Error('Can not pick slot that is not on board')
				// Apply
				applySingleUse(game, pickedSlot)

				pickedSlot.row?.heal(100)
			},
		})
	}
}

export default GoldenApple
