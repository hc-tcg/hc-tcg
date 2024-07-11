import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {query, slot} from '../../../filters'
import Card, {SingleUse} from '../../base/card'
import {singleUse} from '../../base/defaults'
import {CardComponent} from '../../../types/components'

class GoldenAppleSingleUseCard extends Card {
	pickCondition = query.every(slot.hermitSlot, query.not(slot.activeRow), query.not(slot.empty))

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
			slot.playerHasActiveHermit,
			slot.someSlotFulfills(this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
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

export default GoldenAppleSingleUseCard
