import classNames from 'classnames'
import {
	Card,
	hasDescription,
	isAttach,
	isHermit,
	isItem,
	isSingleUse,
} from 'common/cards/base/types'
import {EXPANSIONS} from 'common/const/expansions'
import {STRENGTHS} from 'common/const/strengths'
import {GLOSSARY} from 'common/glossary'
import {STATUS_EFFECTS} from 'common/status-effects'
import {CardRarityT, TypeT} from 'common/types/cards'
import {WithoutFunctions} from 'common/types/server-requests'
import {EmptyNode, FormattedTextNode, formatText} from 'common/utils/formatting'
import {FormattedText} from 'components/formatting/formatting'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import React from 'react'
import {useSelector} from 'react-redux'
import css from './card-tooltip.module.scss'

const HERMIT_TYPES: Record<string, string> = {
	ananrchist: 'Anarchist',
	athlete: 'Athlete',
	balanced: 'Balanced',
	bard: 'Bard',
	builder: 'Builder',
	challenger: 'Challenger',
	collector: 'Collector',
	diplomat: 'Diplomat',
	explorer: 'Explorer',
	farm: 'Farm',
	historian: 'Historian',
	inventor: 'Inventor',
	looper: 'Looper',
	miner: 'Miner',
	pacifist: 'Pacifist',
	prankster: 'Prankster',
	pvp: 'PvP',
	redstone: 'Redstone',
	scavenger: 'Scavenger',
	speedrunner: 'Speedrunner',
	terraform: 'Terraform',
	mob: 'Mob',
	everything: 'all',
	null: 'N/A',
}

type Props = {
	card: WithoutFunctions<Card>
}

const getDescription = (card: WithoutFunctions<Card>): React.ReactNode => {
	let text: FormattedTextNode = EmptyNode()
	if (isHermit(card)) {
		let interim = ''
		if (card.primary.power && card.secondary.power) {
			interim = '\n'
		}
		text = formatText(
			(card.primary.power
				? `**${card.primary.name}**\n*${card.primary.power}*`
				: '') +
				interim +
				(card.secondary.power
					? `**${card.secondary.name}**\n*${card.secondary.power}*`
					: ''),
		)
	} else if (hasDescription(card)) {
		text = formatText(`*${card.description}*`)
	}
	return FormattedText(text)
}

const joinJsx = (array: Array<React.ReactNode>) => {
	if (array.length === 0) return <span>None</span>
	if (array.length < 2) return array
	return array.reduce((prev: any, curr: any): any => [prev, ' ', curr])
}

const getStrengthsAndWeaknesses = (
	card: WithoutFunctions<Card>,
): React.ReactNode => {
	if (!isHermit(card)) return null

	const strengths: Array<TypeT> = [] // Old = STRENGTHS[card.type]
	if (card.type) {
		if (card.type.includes('everything')) {
			strengths.push('everything')
			return
		}
		let i
		for (i = 0; i < card.type.length; i++) {
			let j
			for (j = 0; j < card.type[i].length; j++) {
				const type = STRENGTHS[card.type[i]][j]
				if (!strengths.includes(type)) {
					strengths.push(type)
				}
			}
		}
	}
	
	const weaknesses: Array<TypeT> = []
	if (card.type) {
		if (card.type.includes('everything') || card.type.includes('mob')) {
			strengths.push('everything')
			return
		}
		let i
		for (i = 0; i < card.type.length; i++) {
			let litmus: TypeT
			for (litmus in STRENGTHS) {
				const type = card.type[i]
				if (litmus.includes(type) && !weaknesses.includes(litmus)) {
					weaknesses.push(type)
				}
			}
		}
	}

		

	const result = (
		<div className={css.strengthsAndWeaknesses}>
			<div className={css.strengths}>
				<span className={css.swTitle}>Strengths: </span>
				{joinJsx(
					strengths.map((type) => (
						<span key={type} className={css[type]}>
							{HERMIT_TYPES[type]}
						</span>
					)),
				)}
			</div>
			<div className={css.weaknesses}>
				<span className={css.swTitle}>Weaknesses: </span>
				{joinJsx(
					weaknesses.map((type) => (
						<span key={type} className={css[type]}>
							{HERMIT_TYPES[type]}
						</span>
					)),
				)}
			</div>
		</div>
	)
	return result
}

const getName = (card: WithoutFunctions<Card>): React.ReactNode => {
	if (isItem(card)) {
		return (
			<div className={classNames(css.name, css[card.type])}>{card.name}</div>
		)
	}
	return <div className={css.name}>{card.name}</div>
}

const RARITY_DISPLAY_TEXT: Record<CardRarityT, string> = {
	common: 'Common',
	rare: '• Rare •',
	ultra_rare: '✦ Ultra Rare ✦',
	mythic: '★ Mythic ★',
	NA: 'N/A',
}

export const getRarity = (card: WithoutFunctions<Card>): React.ReactNode => {
	return (
		<span className={classNames(css.rarity, css[card.rarity])}>
			{' '}
			{RARITY_DISPLAY_TEXT[card.rarity]}{' '}
		</span>
	)
}

const getExpansion = (card: WithoutFunctions<Card>): React.ReactNode => {
	if (card.expansion !== 'default') {
		const expansion = card.expansion as
			| 'default'
			| 'hermitcraftX'
			| 'hc_plus'
			| 'alter_egos'
			| 'season_x'
			| 'advent_of_tcg'
			| 'dream'
			| 'boss'
			| 'minecraft'
		return (
			<div className={classNames(css.expansion, css[expansion])}>
				■ {EXPANSIONS[expansion].name} Card ■
			</div>
		)
	}
}

const getAttach = (card: WithoutFunctions<Card>): React.ReactNode => {
	if (!isAttach(card)) return null
	return <div className={css.attach}>Attach</div>
}

const getSingleUse = (card: WithoutFunctions<Card>): React.ReactNode => {
	if (!isSingleUse(card)) return null
	return <div className={css.singleUse}>Single Use</div>
}

const getType = (card: WithoutFunctions<Card>): React.ReactNode => {

	if (isHermit(card) || card.type) {
		return (
			<div className={classNames(css.type, css[card.type])}>
				{HERMIT_TYPES[card.type] || card.type}
			</div>
		)
	}
	return null
}

const getSidebarDescriptions = (
	card: WithoutFunctions<Card>,
): React.ReactNode => {
	return (card.sidebarDescriptions || []).map((description, i) => {
		if (description.type === 'statusEffect') {
			const statusEffect = description.name
			return (
				<div key={i} className={classNames(css.cardTooltip, css.small)}>
					<b>
						<u>{STATUS_EFFECTS[statusEffect].name}</u>
					</b>
					<p>{STATUS_EFFECTS[statusEffect].description}</p>
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

const CardInstanceTooltip = ({card}: Props) => {
	const settings = useSelector(getSettings)

	return (
		<div className={css.cardTooltipContainer}>
			{settings.showAdvancedTooltips && (
				<div className={css.tooltipBelow}>{getSidebarDescriptions(card)}</div>
			)}
			<div className={css.cardTooltip}>
				<div className={css.topLine}>
					{getName(card)}
					{isHermit(card) && getRarity(card)}
					{getType(card)}
					{getAttach(card)}
					{getSingleUse(card)}
				</div>
				<div className={css.description}>
					{getExpansion(card)}
					{getStrengthsAndWeaknesses(card)}
					{getDescription(card)}
				</div>
				<div></div>
			</div>
		</div>
	)
}

export default CardInstanceTooltip
