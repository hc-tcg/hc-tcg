import classNames from 'classnames'
import {getCardTypeIcon} from 'common/cards/card'
import {
	Card,
	hasDescription,
	isAttach,
	isHermit,
	isItem,
	isSingleUse,
} from 'common/cards/types'
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
	card: WithoutFunctions<Card>
	showStatsOnTooltip: boolean
}

const getDescription = (card: WithoutFunctions<Card>): React.ReactNode => {
	let text: FormattedTextNode = EmptyNode()
	if (isHermit(card)) {
		text = formatText(
			[card.primary, card.secondary]
				.flatMap((attack) =>
					attack.power
						? [
								`**${attack.name}**${attack.passive ? ' (Passive)' : ''}\n*${attack.power}*`,
							]
						: [],
				)
				.join('\n'),
		)
	} else if (hasDescription(card)) {
		text = formatText(`*${card.description}*`)
	}
	return FormattedText(text)
}

const getDescriptionWithStats = (
	card: WithoutFunctions<Card>,
): React.ReactNode => {
	let text: FormattedTextNode = EmptyNode()
	if (isHermit(card)) {
		return (
			<div>
				<div>{FormattedText(formatText(`Health - **${card.health}**`))}</div>
				{[card.primary, card.secondary].flatMap((attack) => [
					attack.passive ? (
						<div className={css.moveStats}>
							<div />
							{FormattedText(formatText(`**${attack.name}** (Passive)`))}
						</div>
					) : (
						<div className={css.moveStats}>
							<div>
								{attack.cost.map((type, i) => (
									<img
										width={'16px'}
										height={'16px'}
										key={i}
										src={getCardTypeIcon(type)}
										className={classNames(css.costItem, css[type])}
									/>
								))}
							</div>
							{FormattedText(
								formatText(`**${attack.name}** - **${attack.damage}**`),
							)}
						</div>
					),
					attack.power && <div>{FormattedText(formatText(attack.power))}</div>,
				])}
			</div>
		)
	} else if (hasDescription(card)) {
		text = formatText(`*${card.description}*`)
		return FormattedText(text)
	}
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

	const strengths = STRENGTHS[card.type]
	const weaknesses = Object.entries(STRENGTHS)
		.filter(([, value]) => value.includes(card.type))
		.map(([key]) => key) as Array<TypeT>

	const result = (
		<div className={css.strengthsAndWeaknesses}>
			<div className={css.strengths}>
				<span className={css.swTitle}>Strengths: </span>
				{joinJsx(
					strengths.map((type, i) => (
						<span key={i} className={css[type]}>
							{HERMIT_TYPES[type]}
						</span>
					)),
				)}
			</div>
			<div className={css.weaknesses}>
				<span className={css.swTitle}>Weaknesses: </span>
				{joinJsx(
					weaknesses.map((type, i) => (
						<span key={i} className={css[type]}>
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
	rare: '✦ Rare ✦',
	ultra_rare: '★ Ultra Rare ★',
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
			| 'alter_egos'
			| 'advent_of_tcg'
			| 'alter_egos_ii'
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
	if (isHermit(card)) {
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

const CardInstanceTooltip = ({card, showStatsOnTooltip}: Props) => {
	const settings = useSelector(getSettings)

	return (
		<div className={css.cardTooltipContainer}>
			{settings.showAdvancedTooltips && (
				<div className={css.tooltipBelow}>{getSidebarDescriptions(card)}</div>
			)}
			<div className={css.cardTooltip}>
				<div className={css.topLine}>
					{getName(card)}
					{(isHermit(card) || isAttach(card) || isSingleUse(card)) &&
						getRarity(card)}
					{getType(card)}
					{getAttach(card)}
					{getSingleUse(card)}
				</div>
				<div className={css.description}>
					{getExpansion(card)}
					{getStrengthsAndWeaknesses(card)}
					{showStatsOnTooltip
						? getDescriptionWithStats(card)
						: getDescription(card)}
				</div>
				<div></div>
			</div>
		</div>
	)
}

export default CardInstanceTooltip
