import classnames from 'classnames'
import {CardInfoT} from 'types/cards'
import HermitCard, {HermitCardProps} from './hermit-card'
import EffectCard, {EffectCardProps} from './effect-card'
import ItemCard, {ItemCardProps} from './item-card'
import HealthCard, {HealthCardProps} from './health-card'
import css from './card.module.css'

type CardProps = {
	card: CardInfoT
	selected?: boolean
	onClick?: () => void
}

const Card = (props: CardProps) => {
	const {type} = props.card
	const {onClick, selected, ...otherProps} = props
	let card = null
	if (type === 'hermit')
		card = <HermitCard {...(otherProps as HermitCardProps)} />
	else if (type === 'item')
		card = <ItemCard {...(otherProps as ItemCardProps)} />
	else if (['effect', 'single_use'].includes(type))
		card = <EffectCard {...(otherProps as EffectCardProps)} />
	else if (type === 'health')
		card = <HealthCard {...(otherProps as HealthCardProps)} />
	else throw new Error('Unsupported card type: ' + type)
	return (
		<div
			className={classnames(css.card, {[css.selected]: selected})}
			onClick={onClick}
		>
			{card}
		</div>
	)
}

export default Card
