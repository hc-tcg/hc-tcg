import cn from 'classnames'
import CardComponent from 'components/card'
import css from './card-list.module.scss'

import {CARDS} from 'common/cards'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
} from 'common/types/server-requests'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import StatusEffectContainer from '../../app/game/board/board-status-effects'
import {Ref, RefObject, useEffect, useState} from 'react'
import {select} from 'redux-saga/effects'

type DesktopCardListOptions = {
	cards: Array<LocalCardInstance>
	unpickable?: Array<LocalCardInstance>
	selected?: Array<LocalCardInstance | null>
	onClick?: (card: LocalCardInstance) => void
	statusEffects?: Array<LocalStatusEffectInstance>
	top: number
	left: number
	height: number
}

function DesktopHand({
	cards,
	unpickable,
	selected,
	onClick,
	statusEffects = [],
	top,
	left,
	height,
}: DesktopCardListOptions) {
	const cardSize = height * (7 / 9)

	let [hovered, setHovered] = useState(-1)

	let mouseNotOnSelected = false

	cards.map((card, i) => {
		const isSelected = selected
			? selected.some((selectedCard) => card.entity === selectedCard?.entity)
			: false
		if (isSelected && hovered == -1) {
			hovered = i
			mouseNotOnSelected = true
		}
	})

	const cardsOutput = cards.map((card, i) => {
		const isSelected = selected
			? selected.some((selectedCard) => card.entity === selectedCard?.entity)
			: false
		const isUnpickable = !!unpickable?.find(
			(findCard) => findCard.entity === card.entity,
		)

		let centerCard = (cards.length - 1) / 2

		let myLeft = left - cardSize / 2 - (centerCard - i) * cardSize
		let myTop = top - cardSize / 2
		let myScale = 1

		if (isSelected) {
			myScale = 1.05
		}

		if (hovered != -1) {
			if (hovered < i) {
				myLeft += cardSize * 0.07
			}
			if (hovered > i) {
				myLeft -= cardSize * 0.07
			}
			if (hovered == i && !mouseNotOnSelected) {
				myScale = 1.1
			}
			myLeft -= (cards.length / 2 - hovered) * cardSize * 0.03
		}

		let cardComponent = (
			<div
				style={{
					position: 'absolute',
					top: myTop,
					left: myLeft,
					transform: `scale(${myScale}, ${myScale})`,
					width: cardSize,
					transition: 'all 0.1s ease-in',
					zIndex: hovered == i ? 11 : 10,
				}}
			>
				<CardComponent
					className={cn(css.card, {
						[css.clickable]: !!onClick,
					})}
					onClick={() => onClick && onClick(card)}
					onHover={() => {
						setHovered(i)
					}}
					onUnhover={() => {
						setHovered(-1)
					}}
					card={card.id}
					unpickable={isUnpickable}
					disabled={false}
					selected={isSelected}
					picked={false}
					tooltipAboveModal={false}
					displayTokenCost={false}
					key={card.entity}
				/>
			</div>
		)

		let thisCardsEffects = statusEffects.filter(
			(x) => x.target.type === 'card' && x.target.card === card.entity,
		)

		if (thisCardsEffects.length) {
			cardComponent = (
				<div className={css.cardWithStatus}>
					{cardComponent}
					<StatusEffectContainer
						statusEffects={thisCardsEffects}
						tooltipAboveModal={false}
					/>
				</div>
			)
		}
		return (
			<div
				key={card.entity}
				className={css.defaultSize}
				style={{
					transition: 'all 0.5s ease-in-out',
				}}
			>
				{cardComponent}
			</div>
		)
	})

	return <div className={cn(css.cardList)}>{cardsOutput}</div>
}

export default DesktopHand
