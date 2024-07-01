import cn from 'classnames'
import {CARDS} from 'common/cards'
import {CardT} from 'common/types/game-state'
import CardComponent from 'components/card'
import css from './card-list.module.scss'

import {CSSTransition, TransitionGroup} from 'react-transition-group'
import Card from 'common/cards/base/card'
import {equalCard} from 'common/utils/cards'

type CardListProps = {
	cards: Array<CardT>
	disabled?: Array<string>
	unpickable?: Array<CardT>
	selected?: Array<CardT | null>
	picked?: Array<CardT>
	onClick?: (card: CardT) => void
	wrap?: boolean
	tooltipAboveModal?: boolean
	enableAnimations?: boolean
}

const CardList = (props: CardListProps) => {
	const {wrap, onClick, cards, disabled, unpickable, selected, picked, enableAnimations} = props

	const cardsOutput = cards.map((card) => {
		const info = CARDS[card.cardId] as Card
		if (!info) return null
		const isSelected = selected
			? selected.some((selectedCard) => equalCard(card, selectedCard))
			: false
		const isPicked = !!picked?.find((pickedCard) => equalCard(card, pickedCard))
		const isDisabled = !!disabled?.find((id) => id == card.cardId)
		const isUnpickable = !!unpickable?.find(
			(findCard) => findCard.cardInstance === card.cardInstance
		)

		const cssClasses =
			enableAnimations !== false
				? {
						enter: css.enter,
						enterActive: css.enterActive,
						enterDone: css.enterDone,
						exit: css.exit,
						exitActive: css.exitActive,
					}
				: {}

		return (
			<CSSTransition
				key={card.cardInstance}
				timeout={250}
				unmountOnExit={true}
				classNames={cssClasses}
			>
				<CardComponent
					key={card.cardInstance}
					className={cn(css.card, {
						[css.clickable]: !!onClick && !isDisabled,
					})}
					onClick={onClick && !isDisabled ? () => onClick(card) : undefined}
					card={info}
					unpickable={isUnpickable}
					disabled={isDisabled}
					selected={isSelected}
					picked={isPicked}
					tooltipAboveModal={props.tooltipAboveModal}
				/>
			</CSSTransition>
		)
	})

	return (
		<TransitionGroup className={cn(css.cardList, {[css.wrap]: wrap})}>
			{cardsOutput}
		</TransitionGroup>
	)
}

export default CardList
