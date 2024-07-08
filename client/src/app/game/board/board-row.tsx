import {LocalRowState} from 'common/types/game-state'
import Slot from './board-slot'
import css from './board.module.scss'
import cn from 'classnames'
import {BoardSlotTypeT, SlotTypeT} from 'common/types/cards'
import {LocalCardInstance, LocalStatusEffectInstance} from 'common/types/server-requests'
import HealthSlot from './board-health'

const getCardBySlot = (
	slotType: SlotTypeT,
	slotIndex: number,
	row: LocalRowState | null
): LocalCardInstance | null => {
	if (!row) return null
	if (slotType === 'hermit') return row.hermitCard || null
	if (slotType === 'attach') return row.effectCard || null
	if (slotType === 'item') return row.itemCards[slotIndex] || null
	return null
}

type BoardRowProps = {
	type: 'left' | 'right'
	rowIndex: number
	onClick: (card: LocalCardInstance | null, slot: SlotTypeT, index: number) => void
	rowState: LocalRowState
	active: boolean
	playerId: string
	statusEffects: Array<LocalStatusEffectInstance>
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
	const slotTypes: Array<BoardSlotTypeT> = ['item', 'item', 'item', 'attach', 'hermit']
	const slots = slotTypes.map((slotType, slotIndex) => {
		const card = getCardBySlot(slotType, slotIndex, rowState)
		const cssId = slotType === 'item' ? slotType + (slotIndex + 1) : slotType

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
				statusEffects={statusEffects.filter(
					(a) => a.targetInstance.instance == card?.instance && slotType != 'hermit'
				)}
				playerId={playerId}
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
					(a) => a.targetInstance.instance == rowState.hermitCard?.instance
				)}
			/>
		</div>
	)
}

export default BoardRow
