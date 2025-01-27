import cn from 'classnames'
import classNames from 'classnames'
import {getRenderedCardImage} from 'common/cards/card'
import {Card as CardObject} from 'common/cards/types'
import debugConfig from 'common/config/debug-config'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
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
	const {
		onClick,
		selected,
		picked,
		unpickable,
		displayTokenCost,
		...otherProps
	} = props

	const {category} = props.card

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

	const disabled =
		EXPANSIONS[props.card.expansion].disabled === true ||
		serverConfig.limits.disabledCards.includes(props.card.id)
			? 'disabled'
			: 'enabled'

	return (
		<Tooltip
			tooltip={
				<CardInstanceTooltip card={props.card} showStatsOnTooltip={false} />
			}
			showAboveModal={props.tooltipAboveModal}
		>
			<button
				className={cn(
					props.className,
					!debugConfig.renderCardsDynamically && css.cardImage,
					{
						[css.selected]: selected,
						[css.picked]: picked,
						[css.unpickable]: unpickable,
					},
				)}
				onClick={unpickable ? () => {} : onClick}
			>
				{debugConfig.renderCardsDynamically ? (
					<div className={cn(css.noPointerEvents, css.card)}>{card}</div>
				) : (
					<div
						className={classNames(
							css.cardImageContainer,
							disabled === 'disabled' && css.disabled,
						)}
					>
						<img
							className={css.renderedCardImage}
							src={getRenderedCardImage(props.card, displayTokenCost)}
							width="100%"
							height="100%"
						/>
					</div>
				)}
			</button>
		</Tooltip>
	)
}

export default Card
