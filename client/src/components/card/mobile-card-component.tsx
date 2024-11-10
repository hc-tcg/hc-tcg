import classNames from 'classnames'
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

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={props.cards[0].props} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<div className={css.MobileCardComponentContainer}>
				<div
					className={classNames(css.MobileCardComponent, small && css.small)}
				>
					{cards[0].props.category === 'hermit' && (
						<div>
							<img
								className={css.headInList}
								src={`/images/hermits-emoji/${cards[0].props.id.split('_')[0]}.png`}
							/>
							{small && (
								<div
									className={classNames(
										css.rarityStar,
										css[cards[0].props.rarity],
									)}
								></div>
							)}
						</div>
					)}
					{(cards[0].props.category === 'attach' ||
						cards[0].props.category === 'single_use') && (
						<img
							className={css.headInList}
							src={`/images/effects/${cards[0].props.id}.png`}
						/>
					)}
					{cards[0].props.category === 'item' && isItem(cards[0].props) && (
						<div>
							<img
								className={css.headInList}
								src={getCardTypeIcon(cards[0].props.type)}
							/>
							{small && (
								<div
									className={classNames(
										css.rarityStar,
										css[cards[0].props.rarity],
									)}
								></div>
							)}
						</div>
					)}

					{!small && (
						<div>
							{cards[0].props.name}{' '}
							{cards[0].props.category === 'hermit' && (
								<span>{getRarity(cards[0].props)}</span>
							)}
						</div>
					)}

					<div className={css.amount}>x{cards.length}</div>
					{!small && (
						<div className={css.tokens}>
							{getDeckCost(cards.map((card) => card.props))}
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
