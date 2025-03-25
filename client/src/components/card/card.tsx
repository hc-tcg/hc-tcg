import cn from 'classnames'
import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {getRenderedCardImage} from 'common/cards/card'
import {Attach, Hermit, Item, SingleUse} from 'common/cards/types'
import debugConfig from 'common/config/debug-config'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip from './card-tooltip'
import css from './card.module.scss'
import EffectCardModule from './effect-card-svg'
import HermitCardModule from './hermit-card-svg'
import ItemCardModule from './item-card-svg'

interface CardReactProps
	extends React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> {
	card: number
	displayTokenCost: boolean
	selected?: boolean
	picked?: boolean
	unpickable?: boolean
	tooltipAboveModal?: boolean
	onClick?: () => void
}

const Card = (props: CardReactProps) => {
	const {onClick, selected, picked, unpickable, displayTokenCost} = props

	let cardProps = CARDS[props.card]
	const {category} = cardProps

	let card = null
	if (category === 'hermit')
		card = (
			<HermitCardModule
				card={cardProps as Hermit}
				displayTokenCost={displayTokenCost}
			/>
		)
	else if (category === 'item')
		card = (
			<ItemCardModule
				card={cardProps as Item}
				displayTokenCost={displayTokenCost}
			/>
		)
	else if (['attach', 'single_use'].includes(category))
		card = (
			<EffectCardModule
				card={cardProps as Attach | SingleUse}
				displayTokenCost={displayTokenCost}
			/>
		)
	else throw new Error('Unsupported card category: ' + category)

	const disabled =
		EXPANSIONS[cardProps.expansion].disabled === true ||
		serverConfig.limits.disabledCards.includes(cardProps.id)
			? 'disabled'
			: 'enabled'

	return (
		<Tooltip
			tooltip={
				<CardInstanceTooltip card={cardProps} showStatsOnTooltip={false} />
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
						[css.clickable]: !!props.disabled,
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
							src={getRenderedCardImage(cardProps, displayTokenCost)}
						/>
					</div>
				)}
			</button>
		</Tooltip>
	)
}

export default Card
