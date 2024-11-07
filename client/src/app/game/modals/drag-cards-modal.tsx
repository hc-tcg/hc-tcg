import {CardEntity} from 'common/entities'
import {ModalData} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'
import Card from 'components/card'
import {Modal} from 'components/modal'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React, {useLayoutEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'

type Props = {
	closeModal: () => void
}

type CardInfo = {
	cardRef: null | React.RefObject<HTMLDivElement>
	totalMovement: number
	entity: string
}

type DraggableCardProps = {
	children: React.ReactElement
	entity: string
	draggedCard: string | null
	setDraggedCard: (arg: string | null) => void
	cardInfo: Array<CardInfo>
}

const SQUISH = 0.6

const DraggableCard = ({
	children,
	entity,
	draggedCard,
	setDraggedCard,
	cardInfo,
}: DraggableCardProps) => {
	const cardRef = useRef<HTMLDivElement>(null)
	const thisInfo = cardInfo.find((c) => c.entity === entity)
	if (!thisInfo) return
	thisInfo.cardRef = cardRef

	return (
		<div
			className={css.draggableCard}
			ref={thisInfo.cardRef}
			onMouseDown={() => {
				if (draggedCard !== null && draggedCard !== entity) return
				setDraggedCard(entity)
			}}
			onTouchStart={() => {
				if (draggedCard !== null && draggedCard !== entity) return
				setDraggedCard(entity)
			}}
			style={{
				zIndex:
					draggedCard === entity
						? 500
						: Math.max(100, Math.floor(200 + thisInfo.totalMovement / 10)),
			}}
		>
			{children}
		</div>
	)
}

function DragCardsModal({closeModal}: Props) {
	const dispatch = useMessageDispatch()

	const modalData: ModalData | null | undefined =
		useSelector(getGameState)?.currentModalData
	if (!modalData || modalData.type !== 'dragCards') return null
	// Need to be reversed because the modal shows cards earlier in the array closer to the right, instead of left
	const startingLeftCards: Array<LocalCardInstance> =
		modalData.leftCards.reverse()
	const startingRightCards: Array<LocalCardInstance> =
		modalData.rightCards.reverse()
	const rightAreaRef = useRef<HTMLDivElement>(null)
	const leftAreaRef = useRef<HTMLDivElement>(null)

	const handlePrimary = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: true,
					leftCards: leftCards.reverse(),
					rightCards: rightCards.reverse(),
				},
			},
		})
		closeModal()
	}

	const handleClose = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: false,
					leftCards: null,
					rightCards: null,
				},
			},
		})
		closeModal()
	}

	const [draggedCard, setDraggedCard] = useState<string | null>(null)
	const [cardsInfo, _setCardsInfo] = useState<Array<CardInfo>>([
		...startingLeftCards.map((card, i) => ({
			cardRef: null,
			totalMovement: 0 - i,
			entity: card.entity,
			foundHome: false,
		})),
		...startingRightCards.map((card, i) => ({
			cardRef: null,
			totalMovement: 500 + i,
			entity: card.entity,
			foundHome: false,
		})),
	])
	const [rightCards, setRightCards] = useState<Array<CardEntity>>([])
	const [leftCards, setLeftCards] = useState<Array<CardEntity>>([])

	const translateCards = (
		cardPosition: DOMRect,
		cardPositions: (DOMRect | null)[],
		card: CardInfo,
		area: DOMRect,
		direction: 'left' | 'right',
		animate: boolean,
	) => {
		if (!card.cardRef?.current) return
		if (
			(direction === 'right' && cardPosition.right < area.left) ||
			(direction === 'left' && cardPosition.left > area.right)
		) {
			return
		}
		const others = cardPositions.reduce(
			(r, card) => {
				if (!card) return r
				const centerpoint = (card.left + card.right) / 2
				if (direction === 'right') {
					if (centerpoint > area.left) r.amount += 1
					if (centerpoint > area.left && card.left < cardPosition.left)
						r.myPosition += 1
					return r
				} else if (direction === 'left') {
					if (centerpoint < area.right) r.amount += 1
					if (centerpoint < area.right && card.left < cardPosition.left)
						r.myPosition += 1
					return r
				}
				return r
			},
			{amount: 0, myPosition: 0},
		)
		const centerpoint =
			((area.width * SQUISH) / (2 * others.amount)) *
				(others.myPosition * 2 + 1) +
			area.left +
			area.width * ((1 - SQUISH) / 2)
		card.totalMovement +=
			centerpoint - (cardPosition.left + cardPosition.right) / 2
		if (animate) {
			card.cardRef.current.animate(
				[
					{
						transform: `translateX(${card.totalMovement}px)`,
					},
				],
				{
					fill: 'forwards',
					duration: 100,
				},
			)
			setTimeout(() => {
				if (!card.cardRef?.current) return
				const animation = card.cardRef.current.getAnimations()[0]
				if (animation) animation.cancel()
				card.cardRef.current.style.transform = `translateX(${card.totalMovement}px)`
			}, 100)
		} else {
			card.cardRef.current.style.transform = `translateX(${card.totalMovement}px)`
		}
	}

	const getCardsOverArea = (
		cardPositions: Array<{
			card: DOMRect | null
			entity: CardEntity
		}>,
		area: DOMRect,
		direction: 'left' | 'right',
	) => {
		cardPositions.sort((a, b) => {
			if (!a.card || !b.card) return 0
			if (a.card.left > b.card.left) return 1
			return -1
		})
		return cardPositions.reduce((r: Array<CardEntity>, card) => {
			if (!card.card) return r
			const centerpoint = (card.card.left + card.card.right) / 2
			if (direction === 'right') {
				if (card.card && centerpoint >= area.left) r.push(card.entity)
				return r
			} else if (direction === 'left') {
				if (card.card && centerpoint < area.right) r.push(card.entity)
				return r
			}
			return r
		}, [])
	}

	const getCardPositions = () => {
		return cardsInfo.map((card) => {
			if (!card.cardRef?.current)
				return {card: null, entity: card.entity as CardEntity}
			return {
				card: card.cardRef.current.getBoundingClientRect(),
				entity: card.entity as CardEntity,
			}
		})
	}

	const onCardPositionUpdate = (showAnimation: boolean) => {
		if (!rightAreaRef?.current || !leftAreaRef?.current) return
		const rightArea = rightAreaRef.current.getBoundingClientRect()
		const leftArea = leftAreaRef.current.getBoundingClientRect()
		const cardPositions = getCardPositions()

		const tempRightArea = getCardsOverArea(cardPositions, rightArea, 'right')
		const tempLeftArea = getCardsOverArea(cardPositions, leftArea, 'left')

		const rightAreaCardsInfo = cardsInfo.filter((card) =>
			tempRightArea.includes(card.entity as CardEntity),
		)
		const leftAreaCardsInfo = cardsInfo.filter((card) =>
			tempLeftArea.includes(card.entity as CardEntity),
		)

		rightAreaCardsInfo.forEach((card) => {
			if (!card.cardRef?.current) return
			const cardPosition = card.cardRef.current.getBoundingClientRect()

			translateCards(
				cardPosition,
				cardPositions.map((card) => (card ? card.card : null)),
				card,
				rightArea,
				'right',
				showAnimation,
			)
		})

		leftAreaCardsInfo.forEach((card) => {
			if (!card.cardRef?.current) return
			const cardPosition = card.cardRef.current.getBoundingClientRect()

			translateCards(
				cardPosition,
				cardPositions.map((card) => (card ? card.card : null)),
				card,
				leftArea,
				'left',
				showAnimation,
			)
		})

		setTimeout(() => {
			const newCardPositions = getCardPositions()

			const finalRightArea = getCardsOverArea(
				newCardPositions,
				rightArea,
				'right',
			)
			const finalLeftArea = getCardsOverArea(newCardPositions, leftArea, 'left')

			setRightCards(finalRightArea)
			setLeftCards(finalLeftArea)
		}, 100)
	}

	const testForSlide = (e: MouseEvent) => {
		if (!draggedCard) return
		const cardInfo = cardsInfo.find((card) => card.entity === draggedCard)
		if (!cardInfo || !cardInfo.cardRef || !cardInfo.cardRef.current) return
		if (draggedCard !== cardInfo.entity) return
		if (!e.buttons) return
		if (e.movementX) cardInfo.totalMovement += e.movementX
		cardInfo.cardRef.current.style.transform = `translateX(${cardInfo.totalMovement}px)`
	}

	const testForTouch = (e: TouchEvent) => {
		if (!draggedCard) return
		const cardInfo = cardsInfo.find((card) => card.entity === draggedCard)
		if (!cardInfo || !cardInfo.cardRef || !cardInfo.cardRef.current) return
		if (!cardInfo.cardRef || !cardInfo.cardRef.current) return
		if (!e.targetTouches) return
		const result = e.targetTouches[0]
		const boundingRect = cardInfo.cardRef.current.getBoundingClientRect()
		const middle = (boundingRect.right + boundingRect.left) / 2
		cardInfo.totalMovement += result.pageX - middle
		cardInfo.cardRef.current.style.transform = `translateX(${cardInfo.totalMovement}px)`
	}

	useLayoutEffect(() => {
		onCardPositionUpdate(false)
	}, [rightAreaRef.current, leftAreaRef.current])

	const onMouseUp = () => {
		if (draggedCard) onCardPositionUpdate(true)
		setDraggedCard(null)
	}

	const onTouchEnd = (e: TouchEvent) => {
		e.preventDefault()
		onCardPositionUpdate(true)
		setDraggedCard(null)
	}

	useLayoutEffect(() => {
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('mousemove', testForSlide)
		window.addEventListener('touchend', onTouchEnd)
		window.addEventListener('touchmove', testForTouch)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('mousemove', testForSlide)
			window.removeEventListener('touchend', onTouchEnd)
			window.removeEventListener('touchmove', testForTouch)
		}
	}, [draggedCard])

	return (
		<Modal
			setOpen
			title={modalData.name}
			onClose={handleClose}
			disableUserClose={true}
		>
			<Modal.Description>
				{modalData.description}
				<div className={css.draggableCardsContainer}>
					<div className={css.retrievalBox}>
						<div className={css.retrievalArea} ref={leftAreaRef}></div>
						<div className={css.retrievalName}>
							{modalData.leftAreaName}
							{modalData.leftAreaMax && (
								<span>
									{' '}
									({leftCards.length}/{modalData.leftAreaMax})
								</span>
							)}
						</div>
					</div>
					<div className={css.deckSpacer}></div>
					<div className={css.retrievalBox}>
						<div className={css.retrievalArea} ref={rightAreaRef}></div>
						<div className={css.retrievalName}>
							{modalData.rightAreaName}{' '}
							{modalData.rightAreaMax && (
								<span>
									{' '}
									({rightCards.length}/{modalData.rightAreaMax})
								</span>
							)}
						</div>
					</div>
					<div className={css.subContainer}>
						{[...startingLeftCards, ...startingRightCards].map((card) => {
							return (
								<DraggableCard
									entity={card.entity}
									draggedCard={draggedCard}
									setDraggedCard={setDraggedCard}
									cardInfo={cardsInfo}
									key={card.entity}
								>
									<Card
										card={card.props}
										selected={draggedCard === card.entity}
										displayTokenCost={false}
										tooltipAboveModal={true}
									></Card>
								</DraggableCard>
							)
						})}
					</div>
				</div>
			</Modal.Description>
			<Modal.Options>
				<Button
					variant="default"
					size="medium"
					onClick={handlePrimary}
					onTouchEnd={handlePrimary}
					disabled={
						rightCards.length + leftCards.length !==
							startingLeftCards.length + startingRightCards.length ||
						(modalData.rightAreaMax !== null &&
							modalData.rightAreaMax > rightCards.length) ||
						(modalData.leftAreaMax !== null &&
							modalData.leftAreaMax > leftCards.length)
					}
				>
					Confirm
				</Button>
			</Modal.Options>
		</Modal>
	)
}

export default DragCardsModal
