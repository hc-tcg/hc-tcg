import {HealthCardT} from 'types/cards'
import css from './health-card.module.css'
import classnames from 'classnames'

export type HealthCardProps = {
	card: HealthCardT
}

const HealthCard = ({card}: HealthCardProps) => {
	const {health} = card
	return (
		<div className={css.card}>
			<div
				className={classnames(css.cardBackground, {
					[css.healthy]: health >= 200,
					[css.damaged]: health < 200 && health >= 100,
					[css.dying]: health < 100,
				})}
			>
				<div className={css.topLine}>
					<span className={css.type}>HEALTH</span>
				</div>
				<div className={css.healthWrapper}>
					<span className={css.health}>{health}</span>
				</div>
			</div>
		</div>
	)
}

export default HealthCard
