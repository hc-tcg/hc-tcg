import React from 'react'
import classnames from 'classnames'
import {CardInfoT} from 'types/cards'
import css from './card-tooltip.module.css'

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
	return desc.split('\n\n').map((part, index) => <div key={index}>{part}</div>)
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

const getSingleUse = (card: CardInfoT): React.ReactNode => {
	if (card.type !== 'single_use') return null
	return <div className={css.singleUse}>Single Use</div>
}

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
			<div className={css.description}>{getDescription(card)}</div>
		</div>
	)
}

export default CardTooltip
