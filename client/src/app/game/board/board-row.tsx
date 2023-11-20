import {RowState} from 'common/types/game-state'
import {CardT} from 'common/types/game-state'
import Slot from './board-slot'
import css from './board.module.scss'
import cn from 'classnames'
import {AilmentT} from 'common/types/game-state'
import {SlotInfo} from 'common/types/server-requests'
import {BoardSlotTypeT} from 'common/types/cards'

const getCardBySlot = (slot: SlotInfo, row: RowState | null): CardT | null => {
	if (!row) return null
	if (slot.type === 'hermit') return row.hermitCard || null
	if (slot.type === 'effect') return row.effectCard || null
	if (slot.type === 'item') return row.itemCards[slot.index] || null
	return null
}

type BoardRowProps = {
	type: 'left' | 'right'
	onClick: (card: CardT | null, slot: SlotInfo) => void
	rowState: RowState
	active: boolean
	ailments: Array<AilmentT>
}
const BoardRow = ({type, onClick, rowState, active, ailments}: BoardRowProps) => {
	const slotTypes: Array<BoardSlotTypeT> = ['item', 'item', 'item', 'effect', 'hermit', 'health']
	const slots = slotTypes.map((slotType, index) => {
		const slotInfo: SlotInfo = {type: slotType, index: index < 3 ? index : 0}
		const card = getCardBySlot(slotInfo, rowState)
		const cssId = slotType === 'item' ? slotType + (index + 1) : slotType
		return (
			<Slot
				cssId={cssId}
				onClick={() => onClick(card, slotInfo)}
				card={card}
				rowState={rowState}
				active={active}
				key={slotType + '-' + index}
				type={slotType}
				ailments={ailments}
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
		</div>
	)
}

export default BoardRow
