import {CardProps} from 'common/cards/base/types'
import {WithoutFunctions} from 'common/types/server-requests'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip, {getRarity} from './card-tooltip'
import css from './card.module.scss'

interface CardReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	card: WithoutFunctions<CardProps>
	amount: number
	tooltipAboveModal?: boolean
	onClick?: () => void
}

const MobileCardComponent = (props: CardReactProps) => {
	const {onClick, card, amount} = props

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={props.card} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<div className={css.MobileCardComponentContainer}>
				<button onClick={() => onClick}>
					<div className={css.MobileCardComponent}>
						{card.category === 'hermit' && (
							<img
								className={css.headInList}
								src={`/images/hermits-emoji/${card.id.split('_')[0]}.png`}
							/>
						)}
						{(card.category === 'attach' || card.category === 'single_use') && (
							<img
								className={css.headInList}
								src={`/images/effects/${card.id}.png`}
							/>
						)}
						{card.category === 'item' && (
							<img
								className={css.headInList}
								src={`/images/types/type-${card.id.split('_')[1]}.png`}
							/>
						)}
						<div>
							{card.name}{' '}
							{card.category === 'hermit' && <span>{getRarity(card)}</span>}
						</div>
						<div className={css.amount}>x{amount}</div>
					</div>
				</button>
			</div>
		</Tooltip>
	)
}

export default MobileCardComponent
