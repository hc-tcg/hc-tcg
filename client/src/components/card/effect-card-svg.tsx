import {EffectCardT} from 'common/types/cards'
import css from './effect-card-svg.module.scss'

export type EffectCardProps = {
	card: EffectCardT
}

const HermitCard = ({card}: EffectCardProps) => {
	return (
		<svg className={css.card} width="100%" height="100%" viewBox="0 0 400 400">
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
				<image
					className={css.star}
					href={`/images/star_color.svg`}
					x="-15"
					y="65"
					width="390"
				/>
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
				<text x="200" y="33" className={css.type}>
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

export default HermitCard
