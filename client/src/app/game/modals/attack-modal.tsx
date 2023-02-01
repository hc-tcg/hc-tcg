import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import {CardInfoT, EffectCardT, HermitCardT} from 'types/cards'
import classnames from 'classnames'
import CARDS from 'server/cards'
import DAMAGE from 'server/const/damage'
import PROTECTION from 'server/const/protection'
import Strengths from 'server/const/strengths'
import {
	getPlayerActiveRow,
	getOpponentActiveRow,
	getMultiplier,
} from '../game-selectors'
import css from './attack-modal.module.css'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	// TODO - This whole file needs to be rafactored
	const dispatch = useDispatch()
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const availableActions = useSelector(
		(state: RootState) => state.availableActions
	)
	const singleUseCard = useSelector((state: RootState) => {
		if (!state.gameState) return null
		const {players, turnPlayerId} = state.gameState
		if (!players || !turnPlayerId) return null
		return players[turnPlayerId].board.singleUseCard
	})
	const multiplier = useSelector(getMultiplier)

	if (!activeRow || !activeRow.hermitCard) return null
	if (!opponentRow || !opponentRow.hermitCard) return null

	const playerHermitInfo = TYPED_CARDS[
		activeRow.hermitCard.cardId
	] as HermitCardT
	const opponentHermitInfo = TYPED_CARDS[
		opponentRow.hermitCard.cardId
	] as HermitCardT
	const hermitFullName = playerHermitInfo.id.split('_')[0]

	const playerEffectInfo = activeRow.effectCard
		? TYPED_CARDS[activeRow.effectCard.cardId]
		: null
	const opponentEffectInfo =
		opponentRow.effectCard && PROTECTION[opponentRow.effectCard.cardId]
			? TYPED_CARDS[opponentRow.effectCard.cardId]
			: null
	const singleUseInfo = singleUseCard
		? (TYPED_CARDS[singleUseCard.cardId] as EffectCardT)
		: null

	const suAttackInfo =
		singleUseInfo && DAMAGE[singleUseInfo.id]
			? {
					name: singleUseInfo.name,
					damage: DAMAGE[singleUseInfo.id].target || 0,
			  }
			: null

	const protectionAmount =
		suAttackInfo && singleUseInfo?.id === 'golden_axe'
			? 0
			: PROTECTION[opponentRow.effectCard?.cardId as any]?.target || 0

	const hasWeakness = Strengths[playerHermitInfo.hermitType].includes(
		opponentHermitInfo.hermitType
	)

	const handleAttack = (type: 'zero' | 'primary' | 'secondary') => {
		dispatch({type: 'ATTACK', payload: {type}})

		closeModal()
	}

	const effectAttack = () => handleAttack('zero')
	const primaryAttack = () => handleAttack('primary')
	const secondaryAttack = () => handleAttack('secondary')

	const renderAttack = (
		attackInfo: any,
		onClick: () => void,
		icon?: string
	) => {
		const totalDamage = Math.max(
			(icon ? 0 : attackInfo.damage) +
				(suAttackInfo ? suAttackInfo.damage : 0) +
				(hasWeakness ? 20 : 0) -
				(protectionAmount || 0),
			0
		)
		return (
			<div className={css.attack} onClick={onClick}>
				<div
					className={classnames(css.icon, {
						[css.effectIcon]: !!icon,
						[css.hermitIcon]: !icon,
					})}
				>
					<img src={icon || `/images/hermits-nobg/${hermitFullName}.png`} />
				</div>
				<div className={css.info}>
					<div className={css.name}>
						{attackInfo.name} -{' '}
						<span
							className={classnames(css.damage, {
								[css.specialMove]: !!attackInfo.power,
							})}
						>
							{totalDamage}
						</span>
						{multiplier ? (
							<span className={css.multiplier}> x{multiplier}</span>
						) : null}
					</div>
					<div className={css.description}>
						{icon ? null : (
							<>
								<div className={css.hermitDamage}>
									<img
										src={`/images/hermits-nobg/${hermitFullName}.png`}
										width="32"
									/>
								</div>
								<div className={css.damageAmount}>{attackInfo.damage}</div>
							</>
						)}
						{suAttackInfo ? (
							<>
								{!icon ? <div className={css.attackOperator}>+</div> : null}
								<img
									src={`/images/effects/${singleUseInfo?.id}.png`}
									width="16"
									height="16"
								/>
								<div className={css.damageAmount}>{suAttackInfo.damage}</div>
							</>
						) : null}

						{hasWeakness ? (
							<>
								<div className={css.attackOperator}>+</div>
								<img src={`/images/weakness.png`} width="16" height="16" />
								<div className={css.damageAmount}>20</div>
							</>
						) : null}
						{opponentEffectInfo && protectionAmount ? (
							<>
								<div className={css.attackOperator}>-</div>
								<img
									src={`/images/effects/${opponentEffectInfo.id}.png`}
									width="16"
									height="16"
								/>
								<div className={css.damageAmount}>{protectionAmount}</div>
							</>
						) : null}
					</div>
				</div>
			</div>
		)
	}

	return (
		<Modal title="Attack" closeModal={closeModal}>
			<div className={css.attackModal}>
				<div className={css.turnEndNotification}>
					Note that after attacking you won't be able to do any other actions
					this turn.
				</div>
				{suAttackInfo && availableActions.includes('ZERO_ATTACK')
					? renderAttack(
							suAttackInfo,
							effectAttack,
							`/images/effects/${singleUseInfo?.id}.png`
					  )
					: null}
				{availableActions.includes('PRIMARY_ATTACK')
					? renderAttack(playerHermitInfo.primary, primaryAttack)
					: null}
				{availableActions.includes('SECONDARY_ATTACK')
					? renderAttack(playerHermitInfo.secondary, secondaryAttack)
					: null}
			</div>
		</Modal>
	)
}

export default AttackModal
