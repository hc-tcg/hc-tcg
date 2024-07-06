import classnames from 'classnames'
import {CARDS} from 'common/cards'
import Card from 'components/card'
import {CardT, RowState} from 'common/types/game-state'
import css from './board.module.scss'
import HermitCard from 'common/cards/base/hermit-card'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import ItemCard from 'common/cards/base/item-card'
import {SlotTypeT} from 'common/types/cards'
import {useSelector} from 'react-redux'
import {
	getCardsCanBePlacedIn,
	getGameState,
	getPickRequestPickableSlots,
	getSelectedCard,
} from 'logic/game/game-selectors'

export type SlotProps = {
	type: SlotTypeT
	rowIndex?: number
	index?: number
	playerId: string
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
	cssId?: string
}
const Slot = ({type, rowIndex, index, playerId, onClick, card, active, cssId}: SlotProps) => {
	const cardsCanBePlacedIn = useSelector(getCardsCanBePlacedIn)
	const pickRequestPickableCard = useSelector(getPickRequestPickableSlots)
	const selectedCard = useSelector(getSelectedCard)
	const localGameState = useSelector(getGameState)

	let cardInfo = card?.cardId
		? (CARDS[card.cardId] as HermitCard | EffectCard | SingleUseCard | ItemCard)
		: null

	const frameImg = type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	const getPickableSlots = () => {
		if (pickRequestPickableCard !== null && pickRequestPickableCard !== undefined) {
			return pickRequestPickableCard
		}

		if (!cardsCanBePlacedIn || !selectedCard) return []

		return cardsCanBePlacedIn.filter(
			([card, _]) => card?.cardInstance == selectedCard.cardInstance
		)[0][1]
	}

	const getIsPickable = () => {
		for (const slot of getPickableSlots()) {
			if (
				slot.type === type &&
				slot.rowIndex == rowIndex &&
				slot.index == index &&
				slot.playerId == playerId
			) {
				return true
			}
		}
		return false
	}

	let isPickable = false
	let somethingPickable = false
	let isClickable = false

	if (
		(localGameState && localGameState.playerId === localGameState.turn.currentPlayerId) ||
		pickRequestPickableCard !== null
	) {
		isPickable = getIsPickable()
		somethingPickable = selectedCard !== null || pickRequestPickableCard !== null
		isClickable = somethingPickable && isPickable
	}

	if (card !== null) {
		isClickable = true
	}

	return (
		<div
			onClick={isClickable ? onClick : () => {}}
			id={css[cssId || 'slot']}
			className={classnames(css.slot, {
				[css.pickable]: isPickable && somethingPickable,
				[css.unpickable]: !isPickable && somethingPickable,
				[css.available]: isClickable,
				[css[type]]: true,
				[css.empty]: !cardInfo,
				[css.hermitSlot]: type == 'hermit',
				[css.afk]: !active && type !== 'single_use',
			})}
		>
			{cardInfo ? (
				<div className={css.cardWrapper}>
					<Card card={cardInfo} />
				</div>
			) : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
		</div>
	)
}

export default Slot
