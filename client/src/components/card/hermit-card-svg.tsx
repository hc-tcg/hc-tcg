import classnames from 'classnames'
import {
	getCardImage,
	getCardRankIcon,
	getCardTypeIcon,
	getHermitBackground,
} from 'common/cards/card'
import {Hermit} from 'common/cards/types'
import {WithoutFunctions} from 'common/types/server-requests'
import {memo} from 'react'
import css from './hermit-card-svg.module.scss'

export type HermitCardProps = {
	card: WithoutFunctions<Hermit> | Hermit
	displayTokenCost: boolean
}

const COST_PAD = 20
const COST_SIZE = 28
const COST_X = [
	[COST_PAD + COST_SIZE],
	[COST_PAD + COST_SIZE / 2, COST_PAD + COST_SIZE + COST_SIZE / 2],
	[COST_PAD, COST_PAD + COST_SIZE, COST_PAD + COST_SIZE * 2],
]

const HermitCardModule = memo(({card, displayTokenCost}: HermitCardProps) => {
	const rank = getCardRankIcon(card)
	const palette = card.palette || ''
	const backgroundImage = getHermitBackground(card)
	const hermitImage = getCardImage(card)
	const name = card.shortName || card.name
	const nameLength = name.length

	return (
		<svg className={css.card} width="100%" height="100%" viewBox="0 0 400 400">
			<defs>
				<clipPath id="myClip">
					<rect x="55" y="70" width="290" height="178" />
				</clipPath>
			</defs>
			<rect
				className={classnames(css.cardBackground, css[palette])}
				x="10"
				y="10"
				width="380"
				height="380"
				rx="15"
				ry="15"
			/>
			<text
				x="45"
				y="20"
				textLength={nameLength > 7 ? '180px' : ''}
				lengthAdjust="spacingAndGlyphs"
				className={classnames(css.name, css[palette])}
				dominantBaseline="hanging"
				key={0}
			>
				{name}
			</text>
			<text
				x="310"
				y="20"
				className={css.health}
				textAnchor="middle"
				dominantBaseline="hanging"
				key={1}
			>
				{card.health}
			</text>
			<g id="hermit-image">
				<rect x="45" y="60" fill="white" width="310" height="196" />
				<image
					href={backgroundImage}
					x="55"
					y="70"
					width="290"
					clipPath="url(#myClip)"
				/>
				<image
					className={css.hermitImage}
					href={hermitImage}
					x="55"
					y="70"
					width="290"
					clipPath="url(#myClip)"
				/>
			</g>
			<g id="hermit-type">
				<rect
					className={css.typeBackground}
					x="315"
					y="-5"
					width="100"
					height="100"
					rx="50"
					ry="50"
				/>
				<image
					x="327"
					y="12"
					width="68"
					height="68"
					href={getCardTypeIcon(card.type)}
					className={css.type}
				/>
			</g>
			{displayTokenCost && rank !== null ? (
				<g>
					<image
						x="68"
						y="80"
						width="70"
						height="70"
						href={rank}
						className={css.rank}
					/>
				</g>
			) : null}
			<g id="hermit-attacks" className={css.hermitAttacks}>
				<g>
					{!card.primary.passive &&
						card.primary.cost.map((type, i: number) => (
							<image
								key={i}
								href={getCardTypeIcon(type)}
								x={COST_X[card.primary.cost.length - 1][i]}
								y="273"
								width={COST_SIZE}
								height={COST_SIZE}
								className={classnames(css.attackItems, css[palette], css[type])}
							/>
						))}
				</g>
				<text
					x="200"
					y="272"
					className={classnames(css.attackName, css[palette])}
					textAnchor="middle"
					dominantBaseline="hanging"
					key={2}
				>
					{card.primary.shortName ? card.primary.shortName : card.primary.name}
				</text>
				{!card.primary.passive && (
					<text
						x="380"
						y="270"
						className={classnames(css.attackDamage, css[palette], {
							[css.specialMove]: !!card.primary.power,
						})}
						textAnchor="middle"
						dominantBaseline="hanging"
						key={3}
					>
						{card.primary.damage === 0 ? '00' : card.primary.damage}
					</text>
				)}
				<rect x="20" y="315" width="360" height="10" fill="white" />
				{!card.secondary.passive &&
					card.secondary.cost.map((type, i: number) => (
						<image
							key={i}
							href={getCardTypeIcon(type)}
							x={COST_X[card.secondary.cost.length - 1][i]}
							y="343"
							width={COST_SIZE}
							height={COST_SIZE}
							className={classnames(css.attackItems, css[palette], css[type])}
						/>
					))}
				<text
					x="200"
					y="342"
					className={classnames(css.attackName, css[palette], css[palette], {
						[css.specialMove]: !!card.secondary.power,
					})}
					textAnchor="middle"
					dominantBaseline="hanging"
					key={4}
				>
					{card.secondary.shortName
						? card.secondary.shortName
						: card.secondary.name}
				</text>
				{!card.secondary.passive && (
					<text
						x="380"
						y="340"
						className={classnames(css.attackDamage, css[palette], {
							[css.specialMove]: !!card.secondary.power,
						})}
						textAnchor="middle"
						dominantBaseline="hanging"
						key={5}
					>
						{card.secondary.damage === 0 ? '00' : card.secondary.damage}
					</text>
				)}
				{card.primary.passive && (
					<image
						width="110"
						y="260"
						x="10"
						href={'/images/icons/passive-logo.png'}
					></image>
				)}
				{card.secondary.passive && (
					<image
						width="110"
						y="330"
						x="10"
						href={'/images/icons/passive-logo.png'}
					></image>
				)}
			</g>
		</svg>
	)
})

export default HermitCardModule
