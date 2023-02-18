import {EffectCardT} from 'types/cards'
import css from './effect-card-svg.module.css'

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
					x="10"
					y="60"
					width="380"
				/>
				<image
					className={css.icon}
					href={`/images/effects/${card.id}.png`}
					width="220"
					height="220"
					x="90"
					y="140"
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
		</svg>
	)
}

export default HermitCard
