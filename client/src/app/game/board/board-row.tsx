import {LocalRowState} from 'common/types/game-state'
import Slot from './board-slot'
import css from './board.module.scss'
import cn from 'classnames'
import {BoardSlotTypeT, SlotTypeT} from 'common/types/cards'
import {LocalCardInstance, LocalStatusEffectInstance} from 'common/types/server-requests'
import HealthSlot from './board-health'
import {PlayerEntity, SlotEntity} from 'common/entities'

const getSlotByLocation = (
	slotType: SlotTypeT,
	slotIndex: number,
	row: LocalRowState
): {slot: SlotEntity; card: LocalCardInstance | null} => {
	if (slotType === 'hermit') return row.hermit
	if (slotType === 'attach') return row.attach
	if (slotType === 'item') return row.items[slotIndex]
	throw new Error('Unexpected slot type')
}

type BoardRowProps = {
	type: 'left' | 'right'
	player: PlayerEntity
	onClick: (entity: SlotEntity, type: SlotTypeT, card: LocalCardInstance | null) => void
	rowState: LocalRowState
	active: boolean
	statusEffects: Array<LocalStatusEffectInstance>
}

const BoardRow = ({type, player, onClick, rowState, active, statusEffects}: BoardRowProps) => {
	const slotTypes: Array<BoardSlotTypeT> = ['item', 'item', 'item', 'attach', 'hermit']
	const slots = slotTypes.map((slotType, slotIndex) => {
		const slot = getSlotByLocation(slotType, slotIndex, rowState)
		const cssId = slotType === 'item' ? slotType + (slotIndex + 1) : slotType

		return (
			<Slot
				cssId={cssId}
				onClick={() => onClick(slot.slot, slotType, slot.card)}
				card={slot.card}
				entity={slot.slot}
				rowState={rowState}
				active={active}
				key={slotType + '-' + slotIndex}
				type={slotType}
				statusEffects={statusEffects.filter(
					(a) =>
						a.target.type === 'card' && a.target.card === slot.card?.entity && slotType != 'hermit'
				)}
			/>
		)
	})

	return (
		<div
			className={cn(css.row, {
				[css.active]: active,
				[css.reversed]: type === 'right',
			})}
		>
			{slots}
			<HealthSlot
				rowState={rowState}
				statusEffects={statusEffects.filter(
					(a) =>
						(a.target.type === 'card' && a.target.card == rowState.hermit?.card?.entity) ||
						(active && a.target.type === 'player' && a.target.player === player)
				)}
			/>
		</div>
	)
}

export default BoardRow
