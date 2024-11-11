import cn from 'classnames'
import {getRenderedCardImage} from 'common/cards/card'
import {Card as CardObject} from 'common/cards/types'
import {WithoutFunctions} from 'common/types/server-requests'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip from './card-tooltip'
import css from './card.module.scss'

interface CardReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	card: WithoutFunctions<CardObject>
	displayTokenCost: boolean
	selected?: boolean
	picked?: boolean
	unpickable?: boolean
	tooltipAboveModal?: boolean
	onClick?: () => void
}

const Card = (props: CardReactProps) => {
	const {onClick, selected, picked, unpickable, displayTokenCost} = props

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={props.card} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<button
				className={cn(props.className, css.cardImage, {
					[css.selected]: selected,
					[css.picked]: picked,
					[css.unpickable]: unpickable,
				})}
				onClick={unpickable ? () => {} : onClick}
			>
				<img
					unselectable="on"
					className={css.renderedCardImage}
					src={getRenderedCardImage(props.card, displayTokenCost)}
					width="100%"
					height="100%"
				/>
			</button>
		</Tooltip>
	)
}

export default Card
