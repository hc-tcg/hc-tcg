import classnames from 'classnames'
import {CardInfoT} from 'types/cards'
import HermitCard, {HermitCardProps} from './hermit-card-svg'
import EffectCard, {EffectCardProps} from './effect-card-svg'
import ItemCard, {ItemCardProps} from './item-card-svg'
import HealthCard, {HealthCardProps} from './health-card-svg'
import css from './card.module.css'
import Tooltip from 'components/tooltip'
import CARDS from 'server/cards'

window.CARDS = CARDS

type CardProps = {
	card: CardInfoT
	selected?: boolean
	picked?: boolean
	onClick?: () => void
}

const cardTooltip = (card: any) => {
	let desc =
		card.description ||
		card.primary?.power?.description ||
		card.secondary?.power?.description ||
		''
	desc = desc.replaceAll('\n\n', '<br />')
	return (
		<div className={css.cardTooltip}>
			<div className={css.cardName}>
				{card.name || card.hermitType || card.id}
			</div>
			{desc ? (
				<div
					className={css.cardDescription}
					dangerouslySetInnerHTML={{__html: desc}}
				/>
			) : null}
		</div>
	)
}

const Card = (props: CardProps) => {
	const {type} = props.card
	const {onClick, selected, picked, ...otherProps} = props
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
		<Tooltip tooltip={cardTooltip(props.card)}>
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
