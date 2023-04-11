import classnames from 'classnames'
import {ItemCardT} from 'common/types/cards'
import css from './item-card-svg.module.scss'
import {getCardCost, getCardRank} from 'server/utils/validation'
import {useSelector} from 'react-redux'
import {getGameState} from 'logic/game/game-selectors'

export type ItemCardProps = {
	card: ItemCardT
}

const ItemCard = ({card}: ItemCardProps) => {
	const rank = getCardRank(card.id)
	const cost = getCardCost(card)
	const showCost = !useSelector(getGameState)
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
			<g>
				<image
					className={css.star}
					href={`/images/star_white.svg`}
					x="-15"
					y="65"
					width="390"
				/>
				<image
					className={css.icon}
					href={`/images/types/type-${card.hermitType}.png`}
					width="220"
					height="220"
					x="90"
					y="132"
				/>
			</g>
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
				<text x="200" y="33" className={css.type}>
					ITEM
				</text>
			</g>
			{card.rarity === 'rare' ? (
				<g>
					<rect
						className={css.rarity}
						x="302"
						y="302"
						width="100"
						height="100"
						rx="50"
						ry="50"
					/>
					<text x="351" y="331" className={css.x2} fill="black">
						x2
					</text>
				</g>
			) : null}

			{showCost && rank !== 'stone' ? (
				<g>
					<rect
						className={css.rarity}
						x="0"
						y="302"
						width="100"
						height="100"
						rx="50"
						ry="50"
					/>
					<image
						x="15"
						y="315"
						width="70"
						height="70"
						href={`/images/power/${rank}.png`}
						className={css.power}
					/>
					<text
						x="52"
						y="342"
						fontSize="40"
						className={classnames(css.powerText, css[rank])}
					>
						{cost}
					</text>
				</g>
			) : null}

			<defs>
				<filter
					id="drop-shadow"
					colorInterpolationFilters="sRGB"
					x="-50%"
					y="-50%"
					height="200%"
					width="200%"
				>
					<feGaussianBlur
						id="blur"
						in="SourceAlpha"
						stdDeviation="5"
						result="SA-o-blur"
					/>
					<feComponentTransfer in="SA-o-blur" result="SA-o-b-contIN">
						<feFuncA id="contour" type="table" tableValues="0 1" />
					</feComponentTransfer>
					<feComposite
						operator="in"
						in="SA-o-blur"
						in2="SA-o-b-contIN"
						result="SA-o-b-cont"
					/>
					<feComponentTransfer in="SA-o-b-cont" result="SA-o-b-c-sprd">
						<feFuncA id="spread-ctrl" type="linear" slope="200" />
					</feComponentTransfer>
					<feColorMatrix
						id="recolor"
						in="SA-o-b-c-sprd"
						type="matrix"
						values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
						result="SA-o-b-c-s-recolor"
					/>
					<feMerge>
						<feMergeNode in="SA-o-b-c-s-r-mix" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
		</svg>
	)
}

export default ItemCard
