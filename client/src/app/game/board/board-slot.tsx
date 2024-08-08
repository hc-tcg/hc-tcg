import classnames from 'classnames'
import {SlotEntity} from 'common/entities'
import {SlotTypeT} from 'common/types/cards'
import {LocalRowState} from 'common/types/game-state'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
} from 'common/types/server-requests'
import Card from 'components/card'
import {
	getCardsCanBePlacedIn,
	getGameState,
	getPickRequestPickableSlots,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import StatusEffectContainer from './board-status-effects'
import css from './board.module.scss'

export type SlotProps = {
	type: SlotTypeT
	entity?: SlotEntity
	onClick?: () => void
	card: LocalCardInstance | null
	rowState?: LocalRowState
	active?: boolean
	cssId?: string
	statusEffects?: Array<LocalStatusEffectInstance>
}
const Slot = ({
	type,
	entity,
	onClick,
	card,
	active,
	statusEffects,
	cssId,
}: SlotProps) => {
	const settings = useSelector(getSettings)
	const cardsCanBePlacedIn = useSelector(getCardsCanBePlacedIn)
	const pickRequestPickableCard = useSelector(getPickRequestPickableSlots)
	const selectedCard = useSelector(getSelectedCard)
	const localGameState = useSelector(getGameState)

	const frameImg =
		type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	const getPickableSlots = () => {
		if (
			pickRequestPickableCard !== null &&
			pickRequestPickableCard !== undefined
		) {
			return pickRequestPickableCard
		}

		if (!cardsCanBePlacedIn || !selectedCard) return []

		return cardsCanBePlacedIn.filter(
			([card, _]) => card?.entity == selectedCard.entity,
		)[0][1]
	}

	const getIsPickable = () => {
		for (const slot of getPickableSlots()) {
			if (slot === entity) {
				return true
			}
		}
		return false
	}

	let isPickable = false
	let somethingPickable = false
	let isClickable = false

	if (
		(localGameState &&
			localGameState.playerEntity ===
				localGameState.turn.currentPlayerEntity) ||
		pickRequestPickableCard !== null
	) {
		isPickable = getIsPickable()
		somethingPickable =
			selectedCard !== null || pickRequestPickableCard !== null
		isClickable = somethingPickable && isPickable
	}

	if (card !== null) {
		isClickable = true
	}

	return (
		<button
			onClick={isClickable ? onClick : () => {}}
			disabled={!isClickable}
			id={css[cssId || 'slot']}
			className={classnames(css.slot, {
				[css.pickable]:
					isPickable && somethingPickable && settings.slotHighlightingEnabled,
				[css.unpickable]:
					!isPickable && somethingPickable && settings.slotHighlightingEnabled,
				[css.available]: isClickable,
				[css[type]]: true,
				[css.empty]: !card,
				[css.hermitSlot]: type == 'hermit',
				[css.afk]: !active && type !== 'single_use',
			})}
		>
			{card ? (
				<div className={css.cardWrapper}>
					{card.turnedOver ? (
						<img src="/images/card-back.jpg" className={css.cardBack} />
					) : (
						<Card card={card.props} />
					)}
				</div>
			) : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
			<StatusEffectContainer statusEffects={statusEffects || []} />
		</button>
	)
}

export default Slot
