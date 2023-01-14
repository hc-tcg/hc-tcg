import {ItemCardT} from 'types/cards'
import css from './item-card.module.css'
import classnames from 'classnames'

export type ItemCardProps = {
	card: ItemCardT
}

const ItemCard = ({card}: ItemCardProps) => {
	return (
		<div className={css.card}>
			<div
				className={classnames(css.cardBackground, {
					[css[card.hermitType]]: true,
				})}
			>
				<div className={css.topLine}>
					<span className={css.type}>Item</span>
				</div>
				<div className={css.image}>
					<img
						draggable="false"
						className={css.star}
						src={`/images/star_white.svg`}
					/>
					<img
						draggable="false"
						className={css.icon}
						src={`/images/types/type-${card.hermitType}.png`}
						alt={card.id}
						title={card.id}
					/>
				</div>
				{card.rarity === 'rare' ? <div className={css.x2}>X2</div> : null}
			</div>
		</div>
	)
}

export default ItemCard
