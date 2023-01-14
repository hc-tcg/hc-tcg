import {HermitCardT} from 'types/cards'
import css from './hermit-card.module.css'

export type HermitCardProps = {
	card: HermitCardT
}

const HermitCard = ({card}: HermitCardProps) => {
	const hermitFullName = card.id.split('_')[0]
	return (
		<div className={css.card}>
			<div className={css.cardBackground}>
				<div className={css.topLine}>
					<div className={css.name}>{card.name}</div>
					<div className={css.health}>{card.health}</div>
				</div>
				<div className={css.hermitType}>
					<img
						draggable="false"
						src={`/images/types/type-${card.hermitType}.png`}
						alt={card.hermitType}
						title={card.hermitType}
					/>
				</div>
				{['rare', 'ultra_rare'].includes(card.rarity) ? (
					<div className={css.rarity}>
						<img
							draggable="false"
							src={`/images/rarities/${card.rarity}.png`}
							alt={card.rarity}
							title={card.rarity}
						/>
					</div>
				) : null}
				<div className={css.hermitImage}>
					<img
						draggable="false"
						src={`/images/hermits-nobg/${hermitFullName}.png`}
						alt={hermitFullName}
						title={hermitFullName}
					/>
				</div>
				<div className={css.primary}>
					<div className={css.attackCost}>
						{card.primary.cost.map((type, i) => (
							<img
								key={i}
								draggable="false"
								src={`/images/types/type-${type}.png`}
								alt={type}
								title={type}
							/>
						))}
					</div>
					<div className={css.attackName}>{card.primary.name}</div>
					<div className={css.attackDamage}>{card.primary.damage}</div>
				</div>
				<div className={css.attackSeparator} />
				<div className={css.secondary}>
					<div className={css.attackCost}>
						{card.secondary.cost.map((type, i) => (
							<img
								key={i}
								draggable="false"
								src={`/images/types/type-${type}.png`}
								alt={type}
								title={type}
							/>
						))}
					</div>
					<div className={css.attackName}>{card.secondary.name}</div>
					<div className={css.attackDamage}>{card.secondary.damage}</div>
				</div>
			</div>
		</div>
	)
}

export default HermitCard
