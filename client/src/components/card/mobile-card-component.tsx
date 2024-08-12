import {LocalCardInstance} from 'common/types/server-requests'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip, {getRarity} from './card-tooltip'
import css from './card.module.scss'
import {getDeckCost} from 'common/utils/ranks'

interface CardReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	cards: Array<LocalCardInstance>
	tooltipAboveModal?: boolean
	onClick?: () => void
}

const MobileCardComponent = (props: CardReactProps) => {
	const {onClick, cards} = props

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={props.cards[0].props} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<div className={css.MobileCardComponentContainer}>
				<button onClick={onClick}>
					<div className={css.MobileCardComponent}>
						{cards[0].props.category === 'hermit' && (
							<img
								className={css.headInList}
								src={`/images/hermits-emoji/${cards[0].props.id.split('_')[0]}.png`}
							/>
						)}
						{(cards[0].props.category === 'attach' ||
							cards[0].props.category === 'single_use') && (
							<img
								className={css.headInList}
								src={`/images/effects/${cards[0].props.id}.png`}
							/>
						)}
						{cards[0].props.category === 'item' && (
							<img
								className={css.headInList}
								src={`/images/types/type-${cards[0].props.id.split('_')[1]}.png`}
							/>
						)}
						<div>
							{cards[0].props.name}{' '}
							{cards[0].props.category === 'hermit' && (
								<span>{getRarity(cards[0].props)}</span>
							)}
						</div>
						<div className={css.amount}>x{cards.length}</div>
						<div className={css.tokens}>{getDeckCost(cards)}</div>
					</div>
				</button>
			</div>
		</Tooltip>
	)
}

export default MobileCardComponent
