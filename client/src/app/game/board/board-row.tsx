import cn from 'classnames'
import {PlayerEntity, RowEntity, SlotEntity} from 'common/entities'
import {STATUS_EFFECTS} from 'common/status-effects'
import {BoardSlotTypeT, SlotTypeT} from 'common/types/cards'
import {LocalRowState} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import {
	getCurrentPlayerEntity,
	getPickRequestPickableSlots,
	getPlayerEntity,
	getPlayerStateByEntity,
	getSelectedCard,
	getStatusEffects,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
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
	boardForPlayerEntity: PlayerEntity
	rowEntity: RowEntity
	onClick: (
		entity: SlotEntity,
		type: SlotTypeT,
		card: LocalCardInstance | null,
		index: number,
	) => void
	gameOver: boolean
}

function getRowState(playerEntity: PlayerEntity, rowEntity: RowEntity) {
	return (state: RootState) => {
		return getPlayerStateByEntity(playerEntity)(state).board.rows.find(
			(x) => x.entity === rowEntity,
		)
	}
}

function isActiveRow(playerEntity: PlayerEntity, rowEntity: RowEntity) {
	return (state: RootState) => {
		return (
			getPlayerStateByEntity(playerEntity)(state).board.activeRow ===
				rowEntity || false
		)
	}
}

const BoardRow = ({
	type,
	boardForPlayerEntity: player,
	rowEntity,
	onClick,
	gameOver,
}: BoardRowProps) => {
	const settings = useSelector(getSettings)
	const selectedCard = useSelector(getSelectedCard)
	const statusEffects = useSelector(getStatusEffects)
	const playerEntity = useSelector(getPlayerEntity)
	const currentPickableSlots = useSelector(getPickRequestPickableSlots)
	const currentPlayerEntity = useSelector(getCurrentPlayerEntity)
	const rowState = useSelector(getRowState(player, rowEntity))
	const active = useSelector(isActiveRow(player, rowEntity))

	if (!rowState) throw new Error('Row state should always be defined')

	let shouldDim =
		!!(
			settings.slotHighlightingEnabled &&
			(selectedCard || currentPickableSlots) &&
			currentPlayerEntity === playerEntity
		) && !gameOver

	const itemSlots = rowState.items.length
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

		if (slotType === 'item' && itemSlots <= slotIndex)
			return (
				<div
					id={css[cssId]}
					className={cn(css.slot, css[slotType], css.empty, {
						[css.afk]: !active,
					})}
				/>
			)

		return (
			<Slot
				cssId={cssId}
				onClick={() => onClick(slot.slot, slotType, slot.card, slotIndex)}
				card={slot.card}
				entity={slot.slot}
				rowState={rowState}
				active={active}
				key={slotType + '-' + slotIndex}
				statusEffects={statusEffects.filter(
					(a) =>
						a.target.type === 'card' &&
						a.target.card === slot.card?.entity &&
						slotType != 'hermit',
				)}
				type={slotType}
				gameOver={gameOver}
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
						STATUS_EFFECTS[a.id].type === 'damage',
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
