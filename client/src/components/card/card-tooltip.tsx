import React from 'react'
import classnames from 'classnames'
import {HermitTypeT} from 'common/types/cards'
import HermitCard from 'common/cards/card-plugins/hermits/_hermit-card'
import EffectCard from 'common/cards/card-plugins/effects/_effect-card'
import SingleUseCard from 'common/cards/card-plugins/single-use/_single-use-card'
import ItemCard from 'common/cards/card-plugins/items/_item-card'
import HealthCard from 'common/cards/card-plugins/health/_health-card'
import css from './card-tooltip.module.scss'
import STRENGTHS from '../../../../common/const/strengths'
import {getCardRank} from 'server/utils/validation'

const HERMIT_TYPES: Record<string, string> = {
	balanced: 'Balanced',
	builder: 'Builder',
	speedrunner: 'Speedrunner',
	redstone: 'Redstone',
	farm: 'Farm',
	pvp: 'PvP',
	terraform: 'Terraform',
	prankster: 'Prankster',
	miner: 'Miner',
	explorer: 'Explorer',
}

type Props = {
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
}

const getOneDescription = (desc: string): React.ReactNode => {
	return desc.split('\n\n').map((part, index) => <div key={index}>{part || <>&nbsp;</>}</div>)
}

const getDescription = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	const result = []
	if (card instanceof HermitCard) {
		if (card.primary.power) {
			result.push(
				<div key="primary-name" className={css.power}>
					{card.primary.name}
				</div>
			)
			result.push(<div key="primary-power">{getOneDescription(card.primary.power)}</div>)
		}

		if (card.secondary.power) {
			result.push(
				<div key="secondary-name" className={css.power}>
					{card.secondary.name}
				</div>
			)
			result.push(<div key="primary-power">{getOneDescription(card.secondary.power)}</div>)
		}
	}

	if (card instanceof EffectCard || card instanceof SingleUseCard) {
		result.push(<div key="desc">{getOneDescription(card.description)}</div>)
	}

	if (card instanceof ItemCard && card.rarity === 'rare') {
		result.push(<div key="desc">Counts as 2 Item cards</div>)
		return 'Counts as 2 Item cards.'
	}

	return result
}

const joinJsx = (array: Array<React.ReactNode>) => {
	if (array.length === 0) return <span>None</span>
	if (array.length < 2) return array
	return array.reduce((prev: any, curr: any): any => [prev, ', ', curr])
}

const getStrengthsAndWeaknesses = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	if (!(card instanceof HermitCard)) return null

	const strengths = STRENGTHS[card.hermitType]
	const weaknesses = Object.entries(STRENGTHS)
		.filter(([, value]) => value.includes(card.hermitType))
		.map(([key]) => key) as Array<HermitTypeT>

	const result = (
		<div className={css.strengthsAndWeaknesses}>
			<div className={css.strengths}>
				<span className={css.swTitle}>Strengths: </span>
				{joinJsx(
					strengths.map((hermitType) => (
						<span key={hermitType} className={css[hermitType]}>
							{HERMIT_TYPES[hermitType]}
						</span>
					))
				)}
			</div>
			<div className={css.weaknesses}>
				<span className={css.swTitle}>Weaknesses: </span>
				{joinJsx(
					weaknesses.map((hermitType) => (
						<span key={hermitType} className={css[hermitType]}>
							{HERMIT_TYPES[hermitType]}
						</span>
					))
				)}
			</div>
		</div>
	)
	return result
}

const getName = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	if (card instanceof ItemCard) {
		return <div className={classnames(css.name, css[card.hermitType])}>{card.name}</div>
	}
	return <div className={css.name}>{card.name}</div>
}

const getRank = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	const {name, cost} = getCardRank(card.id)
	const highlight = name === 'stone' || name === 'iron' ? '■' : '★'
	return (
		<div className={classnames(css.rank, css[name])}>
			{highlight} {name.charAt(0).toUpperCase() + name.slice(1)} Rank ({cost}{' '}
			{cost !== 1 ? 'tokens' : 'token'}) {highlight}
		</div>
	)
}

const getAttach = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	if (!card.isAttachable()) return null
	return <div className={css.attach}>Attach</div>
}

const getSingleUse = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	if (!(card instanceof SingleUseCard)) return null
	return <div className={css.singleUse}>Single Use</div>
}

const getHermitType = (
	card: HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard
): React.ReactNode => {
	if (card instanceof HermitCard) {
		return (
			<div className={classnames(css.hermitType, css[card.hermitType])}>
				{HERMIT_TYPES[card.hermitType] || card.hermitType} Type
			</div>
		)
	}
	return null
}

const CardTooltip = ({card}: Props) => {
	if (card.type === 'health') return <div>{(card as HealthCard).health} Health</div>
	return (
		<div className={css.cardTooltip}>
			<div className={css.topLine}>
				{getName(card)}
				{getHermitType(card)}
				{getAttach(card)}
				{getSingleUse(card)}
			</div>
			<div className={css.description}>
				{getRank(card)}
				{getStrengthsAndWeaknesses(card)}
				{getDescription(card)}
			</div>
		</div>
	)
}

export default CardTooltip
