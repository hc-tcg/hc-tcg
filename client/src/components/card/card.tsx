import cn from 'classnames'
import {Card as CardObject} from 'common/cards/base/types'
import {WithoutFunctions} from 'common/types/server-requests'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip from './card-tooltip'
import css from './card.module.scss'
import EffectCardModule, {EffectCardProps} from './effect-card-svg'
import HermitCardModule, {HermitCardProps} from './hermit-card-svg'
import ItemCardModule, {ItemCardProps} from './item-card-svg'

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
	const {category} = props.card
	const {
		onClick,
		selected,
		picked,
		unpickable,
		displayTokenCost,
		...otherProps
	} = props
	let card = null
	if (category === 'hermit')
		card = (
			<HermitCardModule
				{...(otherProps as HermitCardProps)}
				displayTokenCost={displayTokenCost}
			/>
		)
	else if (category === 'item')
		card = (
			<ItemCardModule
				{...(otherProps as ItemCardProps)}
				displayTokenCost={displayTokenCost}
			/>
		)
	else if (['attach', 'single_use'].includes(category))
		card = (
			<EffectCardModule
				{...(otherProps as EffectCardProps)}
				displayTokenCost={displayTokenCost}
			/>
		)
	else throw new Error('Unsupported card category: ' + category)

	return (
		<Tooltip
			tooltip={<CardInstanceTooltip card={props.card} />}
			showAboveModal={props.tooltipAboveModal}
		>
			<button
				className={cn(props.className, css.card, {
					[css.selected]: selected,
					[css.picked]: picked,
					[css.unpickable]: unpickable,
				})}
				onClick={unpickable ? () => {} : onClick}
			>
				<div className={css.noPointerEvents}>{card}</div>
			</button>
		</Tooltip>
	)
}

export default Card
