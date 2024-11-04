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
	setCardInfo: (arg: Array<CardInfo>) => void
}

const DraggableCard = ({
	children,
	entity,
	draggedCard,
	setDraggedCard,
	cardInfo,
	setCardInfo,
}: DraggableCardProps) => {
	const [dragging, setDragging] = useState<boolean>(false)
	const cardRef = useRef<HTMLDivElement>(null)
	const thisInfo = cardInfo.find((c) => c.entity === entity)
	if (!thisInfo) return
	thisInfo.cardRef = cardRef

	const testForSlide = (e: MouseEvent) => {
		if (!dragging) return
		if (!cardRef || !cardRef.current) return
		if (!e.buttons) {
			setDragging(false)
			return
		}
		if (e.movementX) thisInfo.totalMovement += e.movementX
		setCardInfo(cardInfo)
		cardRef.current.style.transform = `translateX(${thisInfo.totalMovement}px)`
	}

	const testForTouch = (e: TouchEvent) => {
		if (!dragging) return
		if (draggedCard !== entity) return
		if (!cardRef || !cardRef.current) return
		if (e.targetTouches) {
			const result = e.targetTouches[0]
			const boundingRect = cardRef.current.getBoundingClientRect()
			const middle = (boundingRect.right + boundingRect.left) / 2
			thisInfo.totalMovement += result.clientX - middle
		}
		setCardInfo(cardInfo)
		cardRef.current.style.transform = `translateX(${thisInfo.totalMovement}px)`
	}

	useLayoutEffect(() => {
		window.addEventListener('mousemove', testForSlide)
		window.addEventListener('touchmove', testForTouch)

		return () => {
			window.removeEventListener('mousemove', testForSlide)
			window.addEventListener('touchmove', testForTouch)
		}
	})

	return (
		<div
			className={css.draggableCard}
			ref={thisInfo.cardRef}
			onMouseDown={() => {
				if (draggedCard !== null && draggedCard !== entity) return
				setDraggedCard(entity)
				setDragging(true)
			}}
			onMouseMove={(e) => {
				if (draggedCard !== null && draggedCard !== entity) return
				if (e.buttons === 0) return
				setDraggedCard(entity)
				setDragging(true)
			}}
			onTouchMove={(e) => {
				if (draggedCard !== null && draggedCard !== entity) return
				setDraggedCard(entity)
				setDragging(true)
			}}
			style={{
				zIndex: dragging ? 500 : Math.floor(200 + thisInfo.totalMovement / 10),
				transform: `translateX(${thisInfo.totalMovement})`,
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
	const cards: Array<LocalCardInstance> = modalData.cards
	const topDeckRef = useRef<HTMLDivElement>(null)
	const bottomDeckRef = useRef<HTMLDivElement>(null)

	const handlePrimary = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: {
					result: true,
					bottomCards: bottomCards,
					topCards: topCards,
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
					bottomCards: null,
					topCards: null,
				},
			},
		})
		closeModal()
	}

	const [draggedCard, setDraggedCard] = useState<string | null>(null)
	const [cardInfo, setCardInfo] = useState<Array<CardInfo>>(
		cards.map((card, i) => ({
			cardRef: null,
			totalMovement: 100 + i,
			entity: card.entity,
		})),
	)
	const [topCards, setTopCards] = useState<Array<CardEntity>>([])
	const [bottomCards, setBottomCards] = useState<Array<CardEntity>>([])

	const squish = 0.6

	const translateCards = (
		cardPosition: DOMRect,
		cardPositions: (DOMRect | null)[],
		card: CardInfo,
		area: DOMRect,
		direction: 'less' | 'greater',
		squish: number,
		animate: boolean,
	) => {
		if (!card.cardRef?.current) return
		if (
			(direction === 'greater' && cardPosition.right < area.left) ||
			(direction === 'less' && cardPosition.left > area.right)
		) {
			return
		}
		const others = cardPositions.reduce(
			(r, card) => {
				if (direction === 'greater') {
					if (card && card.right > area.left) r.amount += 1
					if (card && card.right > area.left && card.left < cardPosition.left)
						r.myPosition += 1
					return r
				} else if (direction === 'less') {
					if (card && card.left < area.right) r.amount += 1
					if (card && card.left < area.right && card.left < cardPosition.left)
						r.myPosition += 1
					return r
				}
				return r
			},
			{amount: 0, myPosition: 0},
		)

		const centerpoint =
			((area.width * squish) / (2 * others.amount)) *
				(others.myPosition * 2 + 1) +
			area.left +
			area.width * ((1 - squish) / 2)
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
		direction: 'less' | 'greater',
	) => {
		cardPositions.sort((a, b) => {
			if (!a.card || !b.card) return 0
			if (a.card.left > b.card.left) return 1
			return -1
		})
		return cardPositions.reduce((r: Array<CardEntity>, card) => {
			if (direction === 'greater') {
				if (card.card && card.card.right > area.left) r.push(card.entity)
				return r
			} else if (direction === 'less') {
				if (card.card && card.card.left < area.right) r.push(card.entity)
				return r
			}
			return r
		}, [])
	}

	const onCardPositionUpdate = (showAnimation: boolean) => {
		if (!topDeckRef?.current || !bottomDeckRef?.current) return
		const topArea = topDeckRef.current.getBoundingClientRect()
		const bottomArea = bottomDeckRef.current.getBoundingClientRect()
		const cardPositions = cardInfo.map((card) => {
			if (!card.cardRef?.current)
				return {card: null, entity: card.entity as CardEntity}
			return {
				card: card.cardRef.current.getBoundingClientRect(),
				entity: card.entity as CardEntity,
			}
		})
		cardInfo.forEach((card) => {
			setDraggedCard(null)
			if (!card.cardRef?.current) return
			const cardPosition = card.cardRef.current.getBoundingClientRect()

			translateCards(
				cardPosition,
				cardPositions.map((card) => (card ? card.card : null)),
				card,
				topArea,
				'greater',
				squish,
				showAnimation,
			)
			translateCards(
				cardPosition,
				cardPositions.map((card) => (card ? card.card : null)),
				card,
				bottomArea,
				'less',
				squish,
				showAnimation,
			)
		})

		setTopCards(getCardsOverArea(cardPositions, topArea, 'greater'))
		setBottomCards(getCardsOverArea(cardPositions, bottomArea, 'less'))
	}

	useLayoutEffect(() => {
		onCardPositionUpdate(false)
	}, [])

	const onMouseUp = () => {
		onCardPositionUpdate(true)
	}

	useLayoutEffect(() => {
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('touchend', () => setDraggedCard(null))

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
			window.addEventListener('touchend', () => setDraggedCard(null))
		}
	})

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
						<div className={css.retrievalArea} ref={bottomDeckRef}></div>
						<div className={css.retrievalName}>Bottom of Deck</div>
					</div>
					<div className={css.deckSpacer}></div>
					<div className={css.retrievalBox}>
						<div className={css.retrievalArea} ref={topDeckRef}></div>
						<div className={css.retrievalName}>Top of Deck</div>
					</div>
					<div className={css.subContainer}>
						{cards.map((card, i) => {
							return (
								<DraggableCard
									entity={card.entity}
									draggedCard={draggedCard}
									setDraggedCard={setDraggedCard}
									cardInfo={cardInfo}
									setCardInfo={setCardInfo}
									key={i}
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
					disabled={topCards.length + bottomCards.length !== cards.length}
				>
					Confirm
				</Button>
			</Modal.Options>
		</Modal>
	)
}

export default DragCardsModal
