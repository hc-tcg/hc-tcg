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
			weaknesses.push('everything')
			return
		}
		let i
		for (i = 0; i < card.type.length; i++) {
			const type = card.type[i]
			let litmus: TypeT
			for (litmus in STRENGTHS) {
				if (STRENGTHS[litmus].includes(type) && !weaknesses.includes(litmus)) {
					weaknesses.push(litmus)
				}
			}
		}
	}

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
			<div className={classNames(css.name, css[card.type[0]])}>{card.name}</div>
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
			| 'boss'
			| 'minecraft'
			| 'shifttech'
			| 'btc'
			| 'discord'
			| 'mcyt'
			| 'baseball'
			| 'ninjago'
			| 'television'
			| 'fortnite'
			| 'survivor'
			| 'holidays'
			| 'new_vegas'
			| 'youtube'
			| 'marvel'
			| 'decked_out'
			| 'artifake'
			| 'create'
			| 'his_fig'
			| 'modesto'
			| 'vg_legends'
			| 'touhou'
			| 'villager_news'
			| 'gravity_falls'
			| 'terraria'
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
		return card.type ? (
			<div className={classNames(css.type, css[card.type[0]])}>
				{HERMIT_TYPES[card.type[0]] || card.type}
			</div>
		) : (
			<div className={classNames(css.type, css['null'])}>
				{HERMIT_TYPES['null'] || card.type}
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
