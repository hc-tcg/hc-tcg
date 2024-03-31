import css from './effect-card-svg.module.scss'
import {useSelector} from 'react-redux'
import {getGameState} from 'logic/game/game-selectors'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import {getCardRank} from 'common/utils/ranks'
import {EXPANSIONS, PERMIT_RANKS} from 'common/config'
import classNames from 'classnames'

export type EffectCardProps = {
	card: EffectCard | SingleUseCard
	canShowAsGray: boolean
	obtainedPermits: Array<string>
}

function getRank(cardId: string) {
	if (PERMIT_RANKS.diamond.includes(cardId)) return 'diamond'
	if (PERMIT_RANKS.gold.includes(cardId)) return 'gold'
	if (PERMIT_RANKS.iron.includes(cardId)) return 'iron'
	return 'free'
}

const EffectCardModule = ({card, canShowAsGray, obtainedPermits}: EffectCardProps) => {
	const rank = getCardRank(card.id)
	const showCost = !useSelector(getGameState)
	const thisRank = getRank(card.id)
	const disabled =
		thisRank === 'free' || obtainedPermits.includes(card.id) || !canShowAsGray
			? 'enabled'
			: 'disabled'

	return (
		<svg
			className={classNames(css.card, disabled === 'disabled' ? css.cardDisabled : '')}
			width="100%"
			height="100%"
			viewBox="0 0 400 400"
		>
			<g id="real-card" className={classNames(css[disabled])}>
				<rect
					className={css.cardBackground}
					x="10"
					y="10"
					width="380"
					height="380"
					rx="15"
					ry="15"
				/>
				<g>
					<image className={css.star} href={`/images/star_color.svg`} x="-15" y="65" width="390" />
					<image
						className={css.icon}
						href={`/images/effects/${card.id}.png`}
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
					<text
						x="200"
						y="33"
						className={css.type}
						textAnchor="middle"
						dominantBaseline="hanging"
						key={Math.random()}
					>
						EFFECT
					</text>
				</g>
				<defs>
					<filter
						id="drop-shadow"
						colorInterpolationFilters="sRGB"
						x="-50%"
						y="-50%"
						height="200%"
						width="200%"
					>
						<feGaussianBlur id="blur" in="SourceAlpha" stdDeviation="5" result="SA-o-blur" />
						<feComponentTransfer in="SA-o-blur" result="SA-o-b-contIN">
							<feFuncA id="contour" type="table" tableValues="0 1" />
						</feComponentTransfer>
						<feComposite operator="in" in="SA-o-blur" in2="SA-o-b-contIN" result="SA-o-b-cont" />
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
			</g>
			{thisRank !== 'free' ? (
				<g>
					<image
						x="15"
						y="240"
						width="70"
						height="140"
						href={`/images/ranks/${thisRank}_banner.png`}
						className={css.rank}
					/>
				</g>
			) : null}
		</svg>
	)
}

export default EffectCardModule
