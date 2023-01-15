import {ItemCardT} from 'types/cards'
import css from './item-card-svg.module.css'
import classnames from 'classnames'

export type ItemCardProps = {
	card: ItemCardT
}

const ItemCard = ({card}: ItemCardProps) => {
	return (
		<svg className={css.card} width="100%" height="100%" viewBox="0 0 400 400">
			<rect
				className={classnames(css.cardBackground, {
					[css[card.hermitType]]: true,
				})}
				x="10"
				y="10"
				width="380"
				height="380"
				rx="15"
				ry="15"
			/>
			<g id="type">
				<rect
					className={css.typeBackground}
					x="20"
					y="20"
					width="360"
					height="75"
					rx="15"
					ry="15"
				/>
				<text x="200" y="35" className={css.type}>
					ITEM
				</text>
			</g>
			<g>
				<image
					className={css.star}
					href={`/images/star_white.svg`}
					x="10"
					y="60"
					width="380"
				/>
				<image
					className={css.icon}
					href={`/images/types/type-${card.hermitType}.png`}
					width="220"
					height="220"
					x="90"
					y="140"
				/>
			</g>
			{card.rarity === 'rare' ? (
				<g>
					<rect
						className={css.rarity}
						x="325"
						y="325"
						width="80"
						height="80"
						rx="40"
						ry="40"
					/>
					<text x="363" y="345" className={css.x2} fill="black">
						x2
					</text>
				</g>
			) : null}
		</svg>
	)
}

export default ItemCard
