import classnames from 'classnames'
import HermitCardModule, {HermitCardProps} from './hermit-card-svg'
import EffectCardModule, {EffectCardProps} from './effect-card-svg'
import ItemCardModule, {ItemCardProps} from './item-card-svg'
import HealthCardModule, {HealthCardProps} from './health-card-svg'
import css from './card.module.scss'
import Tooltip from 'components/tooltip'
import CardTooltip from './card-tooltip'
import HermitCard from 'common/cards/card-plugins/hermits/_hermit-card'
import EffectCard from 'common/cards/card-plugins/effects/_effect-card'
import SingleUseCard from 'common/cards/card-plugins/single-use/_single-use-card'
import ItemCard from 'common/cards/card-plugins/items/_item-card'
import HealthCard from 'common/cards/card-plugins/health/_health-card'

type CardProps = {
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
	selected?: boolean
	picked?: boolean
	onClick?: () => void
}

const Card = (props: CardProps) => {
	const {type} = props.card
	const {onClick, selected, picked, ...otherProps} = props
	let card = null
	if (type === 'hermit') card = <HermitCardModule {...(otherProps as HermitCardProps)} />
	else if (type === 'item') card = <ItemCardModule {...(otherProps as ItemCardProps)} />
	else if (['effect', 'single_use'].includes(type))
		card = <EffectCardModule {...(otherProps as EffectCardProps)} />
	else if (type === 'health') card = <HealthCardModule {...(otherProps as HealthCardProps)} />
	else throw new Error('Unsupported card type: ' + type)
	return (
		<Tooltip tooltip={<CardTooltip card={props.card} />}>
			<div
				className={classnames(css.card, {
					[css.selected]: selected,
					[css.picked]: picked,
					[css.selectable]: !!onClick,
				})}
				onClick={onClick}
			>
				{card}
			</div>
		</Tooltip>
	)
}

export default Card
