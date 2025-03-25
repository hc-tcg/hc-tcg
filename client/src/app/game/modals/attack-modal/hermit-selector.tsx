import classnames from 'classnames'
import {CARDS} from 'common/cards'
import {Hermit, isHermit} from 'common/cards/types'
import {
	getPlayerEntity,
	getPlayerStateByEntity,
} from 'logic/game/game-selectors'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {getOpponentActiveRow, getPlayerActiveRow} from '../../game-selectors'
import css from '../game-modals.module.scss'
import Attack from './attack'

type HermitExtra = {
	hermitId: string
	type: 'primary' | 'secondary'
}

type Props = {
	extraAttacks: Array<string>
	handleExtraAttack: (hermitExtra: HermitExtra) => void
}
function HermitSelector({extraAttacks, handleExtraAttack}: Props) {
	// TODO - This whole file needs to be rafactored
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const playerEntity = useSelector(getPlayerEntity)
	const playerState = useSelector(getPlayerStateByEntity(playerEntity))

	const initialId = extraAttacks[0].split(':')[0]
	const [selectedHermit, setSelectedHermit] = useState<string>(initialId)

	if (!activeRow || !playerState || !activeRow.hermit) return null
	if (!opponentRow || !opponentRow.hermit) return null

	const playerHermitInfo =
		activeRow.hermit.card && CARDS[activeRow.hermit.card.id]
	if (!playerHermitInfo || !isHermit(playerHermitInfo)) return null

	const hermitFullName = CARDS[playerHermitInfo.id].id.split('_')[0]

	const eaResult = extraAttacks.reduce(
		(agg, extra) => {
			const [hermitId, action] = extra.split(':')
			const hermitInfo = CARDS[hermitId] as Hermit
			if (!hermitInfo) throw new Error('Invalid extra attack')
			const type = action === 'PRIMARY_ATTACK' ? 'primary' : 'secondary'
			const hermitFullName = hermitInfo.id.split('_')[0]
			agg[hermitId] = agg[hermitId] || {}
			agg[hermitId][type] = (
				<Attack
					key={extra}
					name={hermitInfo[type].name}
					icon={`/images/hermits-nobg/${hermitFullName}.png`}
					attackInfo={hermitInfo[type]}
					onClick={() => handleExtraAttack({hermitId, type})}
					extra
				/>
			)
			return agg
		},
		{} as Record<string, any>,
	)

	const hermitOptions = Object.keys(eaResult).map((hermitId) => {
		const hermitInfo = CARDS[hermitId]
		const hermitFullName = hermitInfo.id.split('_')[0]
		return (
			<img
				key={hermitId}
				onClick={() => setSelectedHermit(hermitId)}
				className={classnames(css.hermitOption, {
					[css.selected]: selectedHermit === hermitId,
				})}
				src={`/images/hermits-emoji/${hermitFullName}.png`}
				alt={hermitInfo.name}
				title={hermitInfo.name}
			/>
		)
	})

	return (
		<div className={css.hermitSelector}>
			<div className={css.attack} style={{cursor: 'default'}}>
				<div className={classnames(css.portrait, css.hermitIcon)}>
					<img src={`/images/hermits-nobg/${hermitFullName}.png`} />
				</div>
				<div className={css.info}>
					<div className={css.name}>
						{playerHermitInfo.secondary.name}
						<span className={css.select}> Select a hermit...</span>
					</div>
					<button className={css.hermitOptions}>{hermitOptions}</button>
				</div>
			</div>
			<div className={css.extraAttacks}>
				{eaResult[selectedHermit].primary || null}
				{eaResult[selectedHermit].secondary || null}
			</div>
		</div>
	)
}

export default HermitSelector
