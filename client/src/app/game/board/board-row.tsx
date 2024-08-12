import cn from 'classnames'
import {PlayerEntity, SlotEntity} from 'common/entities'
import {BoardSlotTypeT, SlotTypeT} from 'common/types/cards'
import {LocalRowState} from 'common/types/game-state'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
} from 'common/types/server-requests'
import {getGameState, getSelectedCard} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import HealthSlot from './board-health'
import Slot from './board-slot'
import StatusEffectContainer from './board-status-effects'
import css from './board.module.scss'

const getSlotByLocation = (
	slotType: SlotTypeT,
	slotIndex: number,
	row: LocalRowState,
): {slot: SlotEntity; card: LocalCardInstance | null} => {
	if (slotType === 'hermit') return row.hermit
	if (slotType === 'attach') return row.attach
	if (slotType === 'item') return row.items[slotIndex]
	throw new Error('Unexpected slot type')
}

type BoardRowProps = {
	type: 'left' | 'right'
	player?: PlayerEntity
	onClick: (
		entity: SlotEntity,
		type: SlotTypeT,
		card: LocalCardInstance | null,
		index: number,
	) => void
	rowState: LocalRowState
	active: boolean
	statusEffects: Array<LocalStatusEffectInstance>
}

const BoardRow = ({
	type,
	player,
	onClick,
	rowState,
	active,
	statusEffects,
}: BoardRowProps) => {
	const settings = useSelector(getSettings)
	const localGameState = useSelector(getGameState)
	const selectedCard = useSelector(getSelectedCard)

	let shouldDim = !!(
		settings.slotHighlightingEnabled &&
		(selectedCard || localGameState?.currentPickableSlots) &&
		localGameState?.turn.currentPlayerEntity === localGameState?.playerEntity
	)

	const slotTypes: Array<BoardSlotTypeT> = [
		'item',
		'item',
		'item',
		'attach',
		'hermit',
	]
	const slots = slotTypes.map((slotType, slotIndex) => {
		const slot = getSlotByLocation(slotType, slotIndex, rowState)
		const cssId = slotType === 'item' ? slotType + (slotIndex + 1) : slotType

		return (
			<Slot
				cssId={cssId}
				onClick={() => onClick(slot.slot, slotType, slot.card, slotIndex)}
				card={slot.card}
				entity={slot.slot}
				rowState={rowState}
				active={active}
				key={slotType + '-' + slotIndex}
				type={slotType}
				statusEffects={statusEffects.filter(
					(a) =>
						a.target.type === 'card' &&
						a.target.card === slot.card?.entity &&
						slotType != 'hermit',
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
				shouldDim={shouldDim}
				damageStatusEffect={statusEffects.find(
					(a) =>
						a.target.type === 'card' &&
						a.target.card === rowState.hermit.card?.entity &&
						a.props.type === 'damage',
				)}
			/>
			<div className={cn(css.effect, css.slot)}>
				<StatusEffectContainer
					shouldDim={shouldDim}
					forHermit={true}
					statusEffects={statusEffects.filter(
						(a) =>
							(a.target.type === 'card' &&
								a.target.card == rowState.hermit?.card?.entity) ||
							(active &&
								a.target.type === 'global' &&
								a.target.player === player),
					)}
				/>
			</div>
		</div>
	)
}

export default BoardRow
