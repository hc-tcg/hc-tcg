import css from './battle-log.module.scss'
import classnames from 'classnames'
import {BattleLogT, BattleLogDescriptionT, PlayerId} from 'common/types/game-state'
import {useSelector, useDispatch} from 'react-redux'
import {getBattleLog} from 'logic/game/game-selectors'
import Tooltip from 'components/tooltip'

export type EntryProps = {
	isOpponent: boolean
	icon: string
	secondIcon?: string
	description: BattleLogDescriptionT[]
	renderingMode?: string
	grayscale?: boolean
	small?: boolean
	cornerLayout?: boolean
}
export type BattleLogProps = {
	player: PlayerId
}

const EntryTooltip = ({
	description,
	isOpponent,
}: {
	description: BattleLogDescriptionT[]
	isOpponent: boolean
}) => {
	return (
		<div>
			{description.map((segment) => {
				return (
					<span
						className={classnames(css.entryTooltip, {
							[css.highlight]: segment.format === 'highlight',
							[css.player]:
								(segment.format === 'player' && !isOpponent) ||
								(segment.format === 'opponent' && isOpponent),
							[css.opponent]:
								(segment.format === 'opponent' && !isOpponent) ||
								(segment.format === 'player' && isOpponent),
						})}
					>
						{segment.condition === undefined && segment.text}
						{segment.condition === 'player' && !isOpponent && segment.text}
						{segment.condition === 'opponent' && isOpponent && segment.text}
					</span>
				)
			})}
		</div>
	)
}

const Entry = ({
	isOpponent,
	icon,
	description,
	secondIcon,
	renderingMode,
	grayscale,
	small,
	cornerLayout,
}: EntryProps) => {
	return (
		<div
			className={classnames(css.entry, {
				[css.player]: !isOpponent,
				[css.otherPlayer]: isOpponent,
				[css.small]: (secondIcon !== undefined && small === undefined) || small,
			})}
		>
			<Tooltip tooltip={<EntryTooltip description={description} isOpponent={isOpponent} />}>
				<div>
					<img
						src={icon}
						className={classnames(css.entryIcon, {
							[css.small]: (secondIcon !== undefined && small === undefined) || small,
							[css.cornerLayout]: cornerLayout,
							[css.smoothRendering]: renderingMode === 'auto',
							[css.grayscale]: grayscale === true,
						})}
					/>
					{secondIcon !== undefined && (
						<img
							src={secondIcon}
							className={classnames(css.entryOverlay, {
								[css.cornerLayout]: cornerLayout,
								[css.smoothRendering]: renderingMode === 'auto',
								[css.grayscale]: grayscale === true,
							})}
						/>
					)}
				</div>
			</Tooltip>
		</div>
	)
}

function BattleLog({player}: BattleLogProps) {
	const entries = useSelector(getBattleLog)
	return (
		<div className={css.log}>
			<div className={css.topElement}></div>
			{entries.slice().map((entry) => {
				return (
					<Entry
						icon={entry.icon}
						isOpponent={player !== entry.player}
						description={entry.description}
						secondIcon={entry.secondIcon}
						renderingMode={entry.renderingMode}
						grayscale={entry.grayscale}
						small={entry.small}
						cornerLayout={entry.cornerLayout}
					/>
				)
			})}
		</div>
	)
}

export default BattleLog
