import {HealthCardT} from 'types/cards'
import css from './health-card-svg.module.css'
import classnames from 'classnames'

export type HealthCardProps = {
	card: HealthCardT
}

const HealthCard = ({card}: HealthCardProps) => {
	const {health} = card
	return (
		<svg
			className={classnames(css.card, {
				[css.healthy]: health >= 200,
				[css.damaged]: health < 200 && health >= 100,
				[css.dying]: health < 100,
			})}
			width="100%"
			height="100%"
			viewBox="0 0 400 400"
		>
			<rect
				className={css.cardBackground}
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
					HEALTH
				</text>
			</g>
			<g>
				<ellipse
					className={css.healthBackground}
					cx="200"
					cy="250"
					rx="205"
					ry="130"
				/>
				<text x="200" y="195" className={css.health}>
					{card.health}
				</text>
			</g>
		</svg>
	)
}

export default HealthCard
