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
}

type DraggableCardProps = {
	children: React.ReactElement
	index: number
	draggedCard: number | null
	setDraggedCard: (arg: number | null) => void
	cardInfo: Array<CardInfo>
	setCardInfo: (arg: Array<CardInfo>) => void
}

const DraggableCard = ({
	children,
	index,
	draggedCard,
	setDraggedCard,
	cardInfo,
	setCardInfo,
}: DraggableCardProps) => {
	const [dragging, setDragging] = useState<boolean>(false)
	const cardRef = useRef<HTMLDivElement>(null)
	cardInfo[index].cardRef = cardRef

	const testForSlide = (e: MouseEvent) => {
		if (!dragging) return
		if (!cardRef || !cardRef.current) return
		if (!e.buttons) {
			setDragging(false)
			return
		}
		if (e.movementX) cardInfo[index].totalMovement += e.movementX
		setCardInfo(cardInfo)
		cardRef.current.style.transform = `translateX(${cardInfo[index].totalMovement}px)`
	}

	useLayoutEffect(() => {
		window.addEventListener('mousemove', testForSlide)

		return () => {
			window.removeEventListener('mousemove', testForSlide)
		}
	})

	return (
		<div
			className={css.draggableCard}
			ref={cardInfo[index].cardRef}
			onMouseDown={() => {
				if (draggedCard !== null && draggedCard !== index) return
				setDraggedCard(index)
				setDragging(true)
			}}
			onMouseMove={(e) => {
				if (draggedCard !== null && draggedCard !== index) return
				if (e.buttons === 0) return
				setDraggedCard(index)
				setDragging(true)
			}}
			style={{
				zIndex: dragging
					? 500
					: Math.floor(100 + cardInfo[index].totalMovement / 100),
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
					bottomCards: bottomCards.map((card) => cards[card].entity),
					topCards: bottomCards.map((card) => cards[card].entity),
				},
			},
		})
		closeModal()
	}

	const [draggedCard, setDraggedCard] = useState<number | null>(null)
	const [cardInfo, setCardInfo] = useState<Array<CardInfo>>(
		cards.map(() => ({
			cardRef: null,
			totalMovement: 0,
		})),
	)
	const [topCards, setTopCards] = useState<Array<number>>([])
	const [bottomCards, setBottomCards] = useState<Array<number>>([])

	const squish = 0.6

	const translateCards = (
		cardPosition: DOMRect,
		cardPositions: (DOMRect | null)[],
		card: CardInfo,
		area: DOMRect,
		direction: 'less' | 'greater',
		squish: number,
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
			card.cardRef.current.getAnimations()[0].cancel()
			card.cardRef.current.style.transform = `translateX(${card.totalMovement}px)`
		}, 100)
	}

	const onMouseUp = () => {
		if (!topDeckRef?.current || !bottomDeckRef?.current) return
		const topArea = topDeckRef.current.getBoundingClientRect()
		const bottomArea = bottomDeckRef.current.getBoundingClientRect()
		const cardPositions = cardInfo.map((card) => {
			if (!card.cardRef?.current) return null
			return card.cardRef.current.getBoundingClientRect()
		})
		cardInfo.forEach((card) => {
			setDraggedCard(null)
			if (!card.cardRef?.current) return
			const cardPosition = card.cardRef.current.getBoundingClientRect()

			translateCards(
				cardPosition,
				cardPositions,
				card,
				topArea,
				'greater',
				squish,
			)
			translateCards(
				cardPosition,
				cardPositions,
				card,
				bottomArea,
				'less',
				squish,
			)
		})

		const getCardsOverArea = (
			cardPositions: (DOMRect | null)[],
			area: DOMRect,
			direction: 'less' | 'greater',
		) => {
			const positionsWithIndex = cardPositions.map((card, i) => ({
				card: card,
				index: i,
			}))
			positionsWithIndex.sort((a, b) => {
				if (!a.card || !b.card) return 0
				if (a.card.left > b.card.left) return 1
				return -1
			})
			return positionsWithIndex.reduce((r: Array<number>, card) => {
				if (direction === 'greater') {
					if (card.card && card.card.right > area.left) r.push(card.index)
					return r
				} else if (direction === 'less') {
					if (card.card && card.card.left < area.right) r.push(card.index)
					return r
				}
				return r
			}, [])
		}

		setTopCards(getCardsOverArea(cardPositions, topArea, 'greater'))
		setBottomCards(getCardsOverArea(cardPositions, bottomArea, 'less'))
	}

	useLayoutEffect(() => {
		window.addEventListener('mouseup', onMouseUp)

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
		}
	})

	return (
		<Modal
			setOpen
			title={modalData.name}
			onClose={() => null}
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
									index={i}
									draggedCard={draggedCard}
									setDraggedCard={setDraggedCard}
									cardInfo={cardInfo}
									setCardInfo={setCardInfo}
								>
									<Card
										card={card.props}
										selected={draggedCard === i}
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
