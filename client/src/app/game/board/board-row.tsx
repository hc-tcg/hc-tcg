import {BoardRowT} from 'types/game-state'
import Slot, {SlotType} from './board-slot'
import css from './board.module.css'

const getCardIdBySlot = (
	slotType: SlotType,
	index: number,
	rowState: BoardRowT | null
): string | null => {
	if (!rowState) return null
	if (slotType === 'hermit') return rowState.hermitCard?.cardId || null
	if (slotType === 'effect') return rowState.effectCard?.cardId || null
	if (slotType === 'item') return rowState.itemCards[index]?.cardId || null
	return null
}

type BoardRowProps = {
	type: 'left' | 'right'
	onClick: (meta: any) => void
	rowState: BoardRowT
	active: boolean
}
const BoardRow = ({type, onClick, rowState, active}: BoardRowProps) => {
	const handleSlotClick = (slotType: SlotType, slotIndex: number) => {
		onClick({slotType, slotIndex})
	}
	const slotTypes: Array<SlotType> = [
		'item',
		'item',
		'item',
		'effect',
		'hermit',
		'health',
	]
	const slots = slotTypes.map((slotType, index) => {
		return (
			<Slot
				onClick={() => handleSlotClick(slotType, index)}
				cardId={getCardIdBySlot(slotType, index, rowState)}
				rowState={rowState}
				active={active}
				key={slotType + '-' + index}
				type={slotType}
			/>
		)
	})
	if (type === 'right') slots.reverse()
	return <div className={css.hermitRow}>{slots}</div>
}

export default BoardRow
