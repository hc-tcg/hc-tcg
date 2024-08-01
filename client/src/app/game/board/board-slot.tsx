import classnames from 'classnames'
import {LocalRowState} from 'common/types/game-state'
import Card from 'components/card'
import css from './board.module.scss'
import {SlotTypeT} from 'common/types/cards'
import {useDispatch, useSelector} from 'react-redux'
import {
	getCardsCanBePlacedIn,
	getGameState,
	getPickRequestPickableSlots,
	getSelectedCard,
} from 'logic/game/game-selectors'
import {LocalCardInstance, LocalStatusEffectInstance} from 'common/types/server-requests'
import StatusEffectContainer from './board-status-effects'
import {SlotEntity} from 'common/entities'
import {useEffect, useState} from 'react'
import {playSound} from 'logic/sound/sound-actions'

export type SlotProps = {
	type: SlotTypeT
	entity?: SlotEntity
	onClick?: () => void
	card: LocalCardInstance | null
	rowState?: LocalRowState
	active?: boolean
	cssId?: string
	statusEffects?: Array<LocalStatusEffectInstance>
	muted?: boolean
}
const Slot = ({
	type,
	entity,
	onClick,
	card,
	active,
	statusEffects,
	cssId,
	muted = false,
}: SlotProps) => {
	const cardsCanBePlacedIn = useSelector(getCardsCanBePlacedIn)
	const pickRequestPickableCard = useSelector(getPickRequestPickableSlots)
	const selectedCard = useSelector(getSelectedCard)
	const localGameState = useSelector(getGameState)
	const [isMoutning, setIsMounting] = useState(true)
	const [hasEverHadCard, setHasEverHasCard] = useState(false)
	const dispatch = useDispatch()

	if (card && !hasEverHadCard) {
		setHasEverHasCard(true)
	}

	useEffect(() => {
		if (isMoutning) {
			setIsMounting(false)
			return
		}
		if (muted) return
		let sound: Array<string> = []
		if (!card) {
			if (type == 'hermit' || type == 'single_use') {
				sound = ['/sfx/Item_Frame_remove_item1.ogg', '/sfx/Item_Frame_remove_item2.ogg']
			}
		} else {
			sound = ['/sfx/Item_Frame_add_item1.ogg', '/sfx/Item_Frame_add_item2.ogg']
		}
		dispatch(playSound(sound[Math.floor(Math.random() * sound.length)]))
	}, [card?.entity])

	useEffect(() => {
		if (!card) return
		if (!hasEverHadCard) return
		if (muted) return

		let sound = ['/sfx/Item_Frame_rotate_item1.ogg', '/sfx/Item_Frame_rotate_item2.ogg']

		dispatch(playSound(sound[Math.floor(Math.random() * sound.length)]))
	}, [active && hasEverHadCard])

	const frameImg = type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	const getPickableSlots = () => {
		if (pickRequestPickableCard !== null && pickRequestPickableCard !== undefined) {
			return pickRequestPickableCard
		}

		if (!cardsCanBePlacedIn || !selectedCard) return []

		return cardsCanBePlacedIn.filter(([card, _]) => card?.entity == selectedCard.entity)[0][1]
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
		</div>
	)
}

export default Slot
