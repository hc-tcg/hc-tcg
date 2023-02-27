import classnames from 'classnames'
import {useTransition, animated} from '@react-spring/web'
import {useRef} from 'react'
import CARDS from 'server/cards'
import {CardT} from 'types/game-state'
import Card from 'components/card'
import css from './card-list.module.css'
import {equalCard} from 'server/utils'

const SIZE = {
	medium: 200,
	small: 120,
}

type CardListProps = {
	cards: Array<CardT>
	selected?: CardT | null
	picked?: Array<CardT>
	stack?: boolean
	onClick?: (card: CardT) => void
	size: 'medium' | 'small'
	wrap?: boolean
}

const CardList = (props: CardListProps) => {
	const {
		stack = false,
		cards,
		wrap,
		onClick,
		selected,
		picked,
		size = 'medium',
	} = props
	const listRef = useRef<HTMLDivElement>(null)

	const transitions = useTransition(cards, {
		config: {duration: 200},
		key: (card: CardT) => card.cardInstance,
		from: {
			width: listRef.current ? 0 : SIZE[size],
			height: listRef.current ? 0 : SIZE[size],
		},
		enter: {width: SIZE[size], height: SIZE[size]},
		leave: {width: 0, height: 0},
	})

	const cardsOutput = transitions((style: any, card: CardT) => {
		const info = CARDS[card.cardId]
		if (!info) return null
		const isSelected = equalCard(card, selected)
		const isPicked = !!picked?.find((pickedCard) => equalCard(card, pickedCard))
		return (
			<animated.div
				style={style}
				key={card.cardInstance}
				className={classnames(css.card, {[css.clickable]: !!onClick})}
			>
				<Card
					onClick={onClick ? () => onClick(card) : undefined}
					card={info}
					selected={isSelected}
					picked={isPicked}
				/>
			</animated.div>
		)
	})

	const stackCards = (cards: Array<CardT>) => {
		const stack: Map<string, CardT[]> = new Map()

		cards.forEach((card) => {
			const cardId = card.cardId
			if (!stack.has(cardId)) {
				stack.set(cardId, [card])
			} else {
				const it = stack.get(cardId)
				if (!it) return
				else stack.set(cardId, [...it, card])
			}
		})
		return stack
	}

	const cardsStackedOutput = Array.from(stackCards(cards)).map(
		([cardId, cardInstances]) => {
			if (cardInstances.length === 1) {
				const info = CARDS[cardId]
				if (!info) return null
				const isSelected = equalCard(cardInstances[0], selected)
				const isPicked = !!picked?.find((pickedCard) =>
					equalCard(cardInstances[0], pickedCard)
				)
				return (
					<div key={cardId} className={css.card}>
						<Card
							onClick={onClick ? () => onClick(cardInstances[0]) : undefined}
							card={info}
							selected={isSelected}
							picked={isPicked}
						/>
					</div>
				)
			} else {
				const cardList = []
				for (let i = 0; i < cardInstances.length; i++) {
					const info = CARDS[cardId]
					if (!info) return null
					const isSelected = equalCard(cardInstances[i], selected)
					const isPicked = !!picked?.find((pickedCard) =>
						equalCard(cardInstances[i], pickedCard)
					)
					cardList.push(
						<Card
							onClick={onClick ? () => onClick(cardInstances[i]) : undefined}
							card={info}
							selected={isSelected}
							picked={isPicked}
						/>
					)
				}
				return (
					<div key={cardId} className={css.stackCard}>
						{cardList}
					</div>
				)
			}
		}
	)

	if (stack === true)
		return (
			<div
				ref={listRef}
				className={classnames(
					css.cardList,
					css[size],
					wrap === false ? css.noWrap : null
				)}
			>
				{cardsStackedOutput}
			</div>
		)
	else
		return (
			<div
				ref={listRef}
				className={classnames(
					css.cardList,
					css[size],
					wrap === false ? css.noWrap : null
				)}
			>
				{cardsOutput}
			</div>
		)
}

export default CardList
