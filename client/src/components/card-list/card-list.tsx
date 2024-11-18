import cn from 'classnames'
import CardComponent from 'components/card'
import css from './card-list.module.scss'

import {LocalCardInstance} from 'common/types/server-requests'
import {CSSTransition, TransitionGroup} from 'react-transition-group'

type CardListProps = {
	cards: Array<LocalCardInstance>
	displayTokenCost: boolean
	disabled?: Array<string>
	unpickable?: Array<LocalCardInstance>
	selected?: Array<LocalCardInstance | null>
	picked?: Array<LocalCardInstance>
	onClick?: (card: LocalCardInstance) => void
	wrap?: boolean
	tooltipAboveModal?: boolean
	disableAnimations?: boolean
}

const CardList = (props: CardListProps) => {
	const {
		displayTokenCost,
		wrap,
		onClick,
		cards,
		disabled,
		unpickable,
		selected,
		picked,
		disableAnimations,
	} = props

	const cardsOutput = cards.map((card) => {
		const isSelected = selected
			? selected.some((selectedCard) => card.entity === selectedCard?.entity)
			: false
		const isPicked = !!picked?.find(
			(pickedCard) => card.entity === pickedCard.entity,
		)
		const isDisabled = !!disabled?.find((id) => id == card.props.id)
		const isUnpickable = !!unpickable?.find(
			(findCard) => findCard.entity === card.entity,
		)

		let cardComponent = (
			<CardComponent
				className={cn(css.card, {
					[css.clickable]: !!onClick && !isDisabled,
				})}
				onClick={onClick && !isDisabled ? () => onClick(card) : undefined}
				card={card.props}
				unpickable={isUnpickable}
				disabled={isDisabled}
				selected={isSelected}
				picked={isPicked}
				tooltipAboveModal={props.tooltipAboveModal}
				displayTokenCost={displayTokenCost}
				key={card.entity}
			/>
		)

		if (!disableAnimations) {
			return (
				<CSSTransition
					key={card.entity}
					timeout={200}
					unmountOnExit={true}
					classNames={{
						enter: css.enter,
						enterActive: css.enterActive,
						enterDone: css.enterDone,
						exit: css.exit,
						exitActive: css.exitActive,
					}}
				>
					<div
						className={cn({[css.autoscale]: wrap, [css.defaultSize]: !wrap})}
					>
						{cardComponent}
					</div>
				</CSSTransition>
			)
		} else {
			return (
				<div
					key={card.entity}
					className={cn({[css.autoscale]: wrap, [css.defaultSize]: !wrap})}
				>
					{cardComponent}
				</div>
			)
		}
	})

	if (!disableAnimations) {
		return (
			<TransitionGroup className={cn(css.cardList, {[css.wrap]: wrap})}>
				{cardsOutput}
			</TransitionGroup>
		)
	} else {
		return (
			<div className={cn(css.cardList, {[css.wrap]: wrap})}>{cardsOutput}</div>
		)
	}
}

export default CardList
