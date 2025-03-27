import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {getCardTypeIcon} from 'common/cards/card'
import {isItem} from 'common/cards/types'
import {LocalCardInstance} from 'common/types/server-requests'
import {getDeckCost} from 'common/utils/ranks'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip, {getRarity} from './card-tooltip'
import css from './card.module.scss'

interface CardReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	cards: Array<LocalCardInstance>
	tooltipAboveModal?: boolean
	onSubtractionClick?: () => void
	onAdditionClick?: () => void
	small: boolean
}

const MobileCardComponent = (props: CardReactProps) => {
	const {onSubtractionClick, onAdditionClick, cards, small} = props

	let card = CARDS[props.cards[0].id]

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={card} showStatsOnTooltip={true} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<div className={css.MobileCardComponentContainer}>
				<div
					className={classNames(css.MobileCardComponent, small && css.small)}
				>
					{card.category === 'hermit' && (
						<div>
							<img
								className={css.headInList}
								src={`/images/hermits-emoji/${card.id.split('_')[0]}.png`}
							/>
							{small && (
								<div
									className={classNames(css.rarityStar, css[card.rarity])}
								></div>
							)}
						</div>
					)}
					{(card.category === 'attach' || card.category === 'single_use') && (
						<img
							className={css.headInList}
							src={`/images/effects/${card.id}.png`}
						/>
					)}
					{card.category === 'item' && isItem(card) && (
						<div>
							<img
								className={css.headInList}
								src={getCardTypeIcon(card.type)}
							/>
							{small && (
								<div
									className={classNames(css.rarityStar, css[card.rarity])}
								></div>
							)}
						</div>
					)}

					{!small && (
						<div>
							{card.name}{' '}
							{card.category === 'hermit' && <span>{getRarity(card)}</span>}
						</div>
					)}

					<div className={css.amount}>x{cards.length}</div>
					{!small && (
						<div className={css.tokens}>
							{getDeckCost(cards.map((card) => CARDS[card.id]))}
						</div>
					)}
				</div>
				{!small && (
					<button onClick={onSubtractionClick} className={css.plusIcon}>
						-
					</button>
				)}
				{!small && (
					<button onClick={onAdditionClick} className={css.plusIcon}>
						+
					</button>
				)}
			</div>
		</Tooltip>
	)
}

export default MobileCardComponent
