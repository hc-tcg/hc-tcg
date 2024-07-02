import {RowState} from 'common/types/game-state'
import {CardT} from 'common/types/game-state'
import Slot from './board-slot'
import css from './board.module.scss'
import cn from 'classnames'
import {StatusEffectT} from 'common/types/game-state'
import {BoardSlotTypeT, SlotInfo, SlotTypeT} from 'common/types/cards'

const getCardBySlot = (
	slotType: SlotTypeT,
	slotIndex: number,
	row: RowState | null
): CardT | null => {
	if (!row) return null
	if (slotType === 'hermit') return row.hermitCard || null
	if (slotType === 'effect') return row.effectCard || null
	if (slotType === 'item') return row.itemCards[slotIndex] || null
	return null
}

type BoardRowProps = {
	type: 'left' | 'right'
	rowIndex: number
	onClick: (card: CardT | null, slot: SlotTypeT, index: number) => void
	rowState: RowState
	active: boolean
	playerId: string
	statusEffects: Array<StatusEffectT>
}

const BoardRow = ({
	type,
	rowIndex,
	onClick,
	rowState,
	active,
	playerId,
	statusEffects,
}: BoardRowProps) => {
	const itemSlots = rowState.itemCards.length
	const slotTypes: Array<BoardSlotTypeT> = ['item', 'item', 'item', 'effect', 'hermit', 'health']
	const slots = slotTypes.map((slotType, slotIndex) => {
		const card = getCardBySlot(slotType, slotIndex, rowState)
		const cssId = slotType === 'item' ? slotType + (slotIndex + 1) : slotType

		if (slotType === 'item' && itemSlots <= slotIndex)
			return (
				<div
					id={css[cssId]}
					className={cn(css.slot, css[slotType], css.empty, {[css.afk]: !active})}
				/>
			)

		return (
			<Slot
				cssId={cssId}
				onClick={() => onClick(card, slotType, slotIndex)}
				card={card}
				rowState={rowState}
				active={active}
				key={slotType + '-' + slotIndex}
				type={slotType}
				rowIndex={rowIndex}
				index={slotIndex}
				playerId={playerId}
				statusEffects={statusEffects}
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
