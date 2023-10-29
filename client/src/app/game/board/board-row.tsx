import {RowState} from 'common/types/game-state'
import {CardT} from 'common/types/game-state'
import Slot from './board-slot'
import {SlotTypeT} from 'common/types/pick-process'
import css from './board.module.scss'
import cn from 'classnames'
import { AilmentT } from 'common/types/game-state'

const getCardBySlot = (
	slotType: SlotTypeT,
	index: number,
	rowState: RowState | null
): CardT | null => {
	if (!rowState) return null
	if (slotType === 'hermit') return rowState.hermitCard || null
	if (slotType === 'effect') return rowState.effectCard || null
	if (slotType === 'item') return rowState.itemCards[index] || null
	return null
}

type BoardRowProps = {
	type: 'left' | 'right'
	onClick: (meta: any) => void
	rowState: RowState
	active: boolean
	ailments: Array<AilmentT>
}
const BoardRow = ({type, onClick, rowState, active, ailments}: BoardRowProps) => {
	const handleSlotClick = (slotType: SlotTypeT, slotIndex: number, card: CardT | null) => {
		onClick({slotType, slotIndex: slotType === 'item' ? slotIndex : 0, card})
	}
	const slotTypes: Array<SlotTypeT> = ['item', 'item', 'item', 'effect', 'hermit', 'health']
	const slots = slotTypes.map((slotType, index) => {
		const card = getCardBySlot(slotType, index, rowState)
		const cssId = slotType === 'item' ? slotType + (index + 1) : slotType
		return (
			<Slot
				cssId={cssId}
				onClick={() => handleSlotClick(slotType, index, card)}
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
