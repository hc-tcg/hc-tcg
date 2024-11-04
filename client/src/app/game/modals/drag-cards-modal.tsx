import {ModalData} from 'common/types/game-state'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import {Modal} from 'components/modal'
import {getGameState} from 'logic/game/game-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React, {useLayoutEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import Card from 'components/card'

type Props = {
	closeModal: () => void
}

type DraggableCardProps = {
	children: React.ReactElement
	index: number
	draggedCard: number | null
	setDraggedCard: (arg: number | null) => void
	cardsOffset: Array<number>
	setCardsOffset: (arg: Array<number>) => void
}

const DraggableCard = ({
	children,
	index,
	draggedCard,
	setDraggedCard,
	cardsOffset,
	setCardsOffset,
}: DraggableCardProps) => {
	const [totalMovement, setTotalMovement] = useState<number>(0)
	const [dragging, setDragging] = useState<boolean>(false)
	const cardRef = useRef<HTMLDivElement>(null)

	const testForSlide = (e: MouseEvent) => {
		if (!dragging) return
		if (!e.buttons) {
			setDragging(false)
			setDraggedCard(null)
			cardRef.current.style.transform = `translateX(${totalMovement}px) translateY(0px)`
			return
		}
		if (!cardRef || !cardRef.current) return
		if (e.movementX) setTotalMovement(totalMovement + e.movementX)
		const boundingRect = cardRef.current.getBoundingClientRect()
		cardsOffset[index] = boundingRect.left
		setCardsOffset(cardsOffset)
		cardRef.current.style.transform = `translateX(${totalMovement + e.movementX}px) translateY(-10px)`
	}

	useLayoutEffect(() => {
		window.addEventListener('mousemove', testForSlide)

		return () => {
			window.removeEventListener('mousemove', testForSlide)
		}
	}, [totalMovement, dragging])

	return (
		<div
			className={css.draggableCardScale}
			ref={cardRef}
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
				zIndex: dragging ? 500 : Math.floor(100 + cardsOffset[index] / 100),
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

	const handlePrimary = () => {
		// RETURN RESULT
	}

	const [draggedCard, setDraggedCard] = useState<number | null>(null)
	const [cardsOffset, setCardsOffset] = useState<Array<number>>(
		Array(cards.length).fill(0),
	)

	const handleClose = () => {
		dispatch({
			type: localMessages.GAME_TURN_ACTION,
			action: {
				type: 'MODAL_REQUEST',
				modalResult: null,
			},
		})
		closeModal()
	}

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
					<div className={css.deckBottom}>Deck Bottom</div>
					<div className={css.deckSpacer}></div>
					<div className={css.deckTop}>Deck Top</div>
					{cards.map((card, i) => {
						return (
							<DraggableCard
								index={i}
								draggedCard={draggedCard}
								setDraggedCard={setDraggedCard}
								cardsOffset={cardsOffset}
								setCardsOffset={setCardsOffset}
							>
								<Card
									card={card.props}
									displayTokenCost={false}
									tooltipAboveModal={true}
								></Card>
							</DraggableCard>
						)
					})}
				</div>
			</Modal.Description>
			<Modal.Options>
				<Button variant="default" size="medium" onClick={handlePrimary}>
					Confirm
				</Button>
			</Modal.Options>
		</Modal>
	)
}

export default DragCardsModal
