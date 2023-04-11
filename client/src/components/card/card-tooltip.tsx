import React from 'react'
import classnames from 'classnames'
import {CardInfoT, HermitTypeT} from 'common/types/cards'
import STRENGTHS from 'server/const/strengths'
import css from './card-tooltip.module.scss'
import {getCardCost, getCardRank} from 'server/utils/validation'

const TYPED_STRENGTHS = STRENGTHS as Record<HermitTypeT, Array<HermitTypeT>>

const HERMIT_TYPES: Record<HermitTypeT, string> = {
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
	card: CardInfoT
}

const getRarity = (card: CardInfoT): React.ReactNode | null => {
	if (card.type === 'health') return null

	if (card.rarity === 'ultra_rare') {
		return (
			<div className={classnames(css.rarity, css.ultraRare)}>
				★ ultra rare ★
			</div>
		)
	}

	if (card.rarity === 'rare') {
		const value = card.type === 'item' ? 'double' : 'rare'
		return <div className={classnames(css.rarity, css.rare)}>★ {value} ★</div>
	}

	if (card.rarity === 'common') {
		return <div className={classnames(css.rarity, css.common)}>■ common ■</div>
	}

	return null
}

const getOneDescription = (desc: string): React.ReactNode => {
	return desc
		.split('\n\n')
		.map((part, index) => <div key={index}>{part || <>&nbsp;</>}</div>)
}

const getDescription = (card: CardInfoT): React.ReactNode => {
	const result = []
	if (card.type === 'hermit') {
		if (card.primary.power) {
			result.push(
				<div key="primary-name" className={css.power}>
					{card.primary.name}
				</div>
			)
			result.push(
				<div key="primary-power">{getOneDescription(card.primary.power)}</div>
			)
		}

		if (card.secondary.power) {
			result.push(
				<div key="secondary-name" className={css.power}>
					{card.secondary.name}
				</div>
			)
			result.push(
				<div key="primary-power">{getOneDescription(card.secondary.power)}</div>
			)
		}
	}

	if (card.type === 'effect' || card.type === 'single_use') {
		result.push(<div key="desc">{getOneDescription(card.description)}</div>)
	}

	if (card.type === 'item' && card.rarity === 'rare') {
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

const getStrengthsAndWeaknesses = (card: CardInfoT): React.ReactNode => {
	if (card.type !== 'hermit') return null

	const strengths = TYPED_STRENGTHS[card.hermitType]
	const weaknesses = Object.entries(TYPED_STRENGTHS)
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

const getName = (card: CardInfoT): React.ReactNode => {
	if (card.type === 'item') {
		return (
			<div className={classnames(css.name, css[card.hermitType])}>
				{card.name}
			</div>
		)
	}
	return <div className={css.name}>{card.name}</div>
}

const getRank = (card: CardInfoT): React.ReactNode => {
	let rank = getCardRank(card.id)
	if (!rank) rank = 'stone'
	const cost = getCardCost(card)
	const highlight = rank === 'stone' || rank === 'iron' ? '■' : '★'
	return (
		<div className={classnames(css.rank, css[rank])}>
			{highlight} {rank.charAt(0).toUpperCase() + rank.slice(1)} Rank ({cost}{' '}
			{cost !== 1 ? 'tokens' : 'token'}) {highlight}
		</div>
	)
}

const getSingleUse = (card: CardInfoT): React.ReactNode => {
	if (card.type !== 'single_use') return null
	return <div className={css.singleUse}>Single Use</div>
}

const getHermitType = (card: CardInfoT): React.ReactNode => {
	if (card.type === 'hermit') {
		return (
			<div className={classnames(css.hermitType, css[card.hermitType])}>
				{HERMIT_TYPES[card.hermitType] || card.hermitType} Type
			</div>
		)
	}
	return null
}

const CardTooltip = ({card}: Props) => {
	return (
		<div className={css.cardTooltip}>
			<div className={css.topLine}>
				{getName(card)}
				{getRarity(card)}
				{getHermitType(card)}
				{getSingleUse(card)}
			</div>
			<div className={css.description}>
				{card.type !== 'health' ? getRank(card) : null}
				{getStrengthsAndWeaknesses(card)}
				{getDescription(card)}
			</div>
		</div>
	)
}

export default CardTooltip
