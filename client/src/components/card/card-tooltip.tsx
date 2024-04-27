import React, {useEffect, useRef, useState} from 'react'
import {HermitTypeT} from 'common/types/cards'
import Card from 'common/cards/base/card'
import css from './card-tooltip.module.scss'
import HermitCard from 'common/cards/base/hermit-card'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import ItemCard from 'common/cards/base/item-card'
import HealthCard from 'common/cards/base/health-card'
import {STRENGTHS} from 'common/const/strengths'
import {getCardRank} from 'common/utils/ranks'
import {EXPANSIONS} from 'common/config'
import classNames from 'classnames'
import {STATUS_EFFECT_CLASSES} from 'common/status-effects'
import {GLOSSARY} from 'common/glossary'
import {useSelector} from 'react-redux'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

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
	card: Card
}

const getOneDescription = (desc: string): React.ReactNode => {
	return desc.split('\n\n').map((part, index) => <div key={index}>{part || <>&nbsp;</>}</div>)
}

const getDescription = (card: Card): React.ReactNode => {
	const result = []
	if (card instanceof HermitCard) {
		if (card.primary.power) {
			result.push(
				<div key="primary-name" className={css.power}>
					{card.primary.name}
				</div>
			)
			result.push(
				<div key="primary-power" className={css.italicized}>
					{getOneDescription(card.primary.power)}
				</div>
			)
		}

		if (card.secondary.power) {
			result.push(
				<div key="secondary-name" className={css.power}>
					{card.secondary.name}
				</div>
			)
			result.push(
				<div key="primary-power" className={css.italicized}>
					{getOneDescription(card.secondary.power)}
				</div>
			)
		}
	}

	if (card instanceof EffectCard || card instanceof SingleUseCard) {
		result.push(
			<div key="desc" className={css.italicized}>
				{getOneDescription(card.description)}
			</div>
		)
	}

	if (card instanceof ItemCard && card.rarity === 'rare') {
		result.push(
			<div key="desc" className={css.italicized}>
				Counts as 2 Item cards
			</div>
		)
		return 'Counts as 2 Item cards.'
	}

	return result
}

const joinJsx = (array: Array<React.ReactNode>) => {
	if (array.length === 0) return <span>None</span>
	if (array.length < 2) return array
	return array.reduce((prev: any, curr: any): any => [prev, ' ', curr])
}

const getStrengthsAndWeaknesses = (card: Card): React.ReactNode => {
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

const getName = (card: Card): React.ReactNode => {
	if (card instanceof ItemCard) {
		return <div className={classNames(css.name, css[card.hermitType])}>{card.name}</div>
	}
	return <div className={css.name}>{card.name}</div>
}

const getRank = (card: Card): React.ReactNode => {
	const {name, cost} = getCardRank(card.id)
	const highlight = name === 'stone' || name === 'iron' ? '■' : '★'
	return (
		<div className={classNames(css.rank, css[name])}>
			{highlight} {name.charAt(0).toUpperCase() + name.slice(1)} Rank {highlight}
		</div>
	)
}

const getExpansion = (card: Card): React.ReactNode => {
	if (card.getExpansion() !== 'default') {
		const expansion = card.getExpansion() as 'default' | 'alter_egos' | 'advent_of_tcg'
		return (
			<div className={classNames(css.expansion, css[expansion])}>
				■ {EXPANSIONS.expansions[expansion]} Card ■
			</div>
		)
	}
}

const getAttach = (card: Card): React.ReactNode => {
	if (!card.showAttachTooltip()) return null
	return <div className={css.attach}>Attach</div>
}

const getSingleUse = (card: Card): React.ReactNode => {
	if (!card.showSingleUseTooltip()) return null
	return <div className={css.singleUse}>Single Use</div>
}

const getHermitType = (card: Card): React.ReactNode => {
	if (card instanceof HermitCard) {
		return (
			<div className={classNames(css.hermitType, css[card.hermitType])}>
				{HERMIT_TYPES[card.hermitType] || card.hermitType} Type
			</div>
		)
	}
	return null
}

const getSidebarDescriptions = (card: Card): React.ReactNode => {
	return card.sidebarDescriptions().map((description, i) => {
		if (description.type === 'statusEffect') {
			const statusEffect = description.name
			return (
				<div key={i} className={classNames(css.cardTooltip, css.small)}>
					<b>
						<u>{STATUS_EFFECT_CLASSES[statusEffect].name}</u>
					</b>
					<p>{STATUS_EFFECT_CLASSES[statusEffect].description}</p>
				</div>
			)
		}
		if (description.type === 'glossary') {
			const glossaryItem = description.name
			return (
				<div key={i} className={classNames(css.cardTooltip, css.small)}>
					<b>
						<u>{GLOSSARY[glossaryItem].name}</u>
					</b>
					<p>{GLOSSARY[glossaryItem].description}</p>
				</div>
			)
		}
	})
}

const CardTooltip = ({card}: Props) => {
	if (card instanceof HealthCard) return null
	const [right, setRight] = useState<number | null>(null)
	const [left, setLeft] = useState<number | null>(null)
	const settings = useSelector(getSettings)

	useEffect(() => {
		if (settings.showAdvancedTooltips === 'off') return
		if (card.sidebarDescriptions().length === 0) return
		setRight(null)
		setLeft(null)
	})

	const positionRef = (element: HTMLDivElement) => {
		if (settings.showAdvancedTooltips === 'off') return
		if (card.sidebarDescriptions().length === 0) return
		if (!element) return
		const boundingRect = element.getBoundingClientRect()
		setRight(boundingRect.right)
		setLeft(boundingRect.left)
	}

	return (
		<div ref={positionRef} className={css.cardTooltipContainer}>
			<div>
				{card.sidebarDescriptions().length > 0 &&
					settings.showAdvancedTooltips === 'on' &&
					left !== null &&
					right !== null && (
						<div
							className={css.tooltipSidebar}
							style={left <= 300 ? {left: `${right - left + 10}px`} : {}}
						>
							{getSidebarDescriptions(card)}
						</div>
					)}
			</div>
			{(card.sidebarDescriptions().length === 0 ||
				settings.showAdvancedTooltips === 'off' ||
				(right !== null && left !== null)) && (
				<div>
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
							{getExpansion(card)}
							{getDescription(card)}
						</div>
					</div>
				</div>
			)}
			{card.sidebarDescriptions().length > 0 &&
				settings.showAdvancedTooltips === 'on' &&
				left !== null &&
				right !== null && <div className={css.tooltipBelow}>{getSidebarDescriptions(card)}</div>}
		</div>
	)
}

export default CardTooltip
