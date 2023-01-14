import {EffectCardT} from 'types/cards'
import css from './effect-card.module.css'

export type EffectCardProps = {
	card: EffectCardT
}

const HermitCard = ({card}: EffectCardProps) => {
	return (
		<div className={css.card}>
			<div className={css.cardBackground}>
				<div className={css.topLine}>
					<span className={css.type}>Effect</span>
				</div>
				<div className={css.image}>
					<img
						draggable="false"
						className={css.star}
						src={`/images/star_color.svg`}
					/>
					<img
						draggable="false"
						className={css.icon}
						src={`/images/effects/${card.id}.png`}
						alt={card.id}
						title={card.id}
					/>
				</div>
			</div>
		</div>
	)
}

export default HermitCard
