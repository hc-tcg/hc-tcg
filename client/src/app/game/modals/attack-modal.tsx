import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT, EffectCardT, HermitCardT} from 'types/cards'
import classnames from 'classnames'
import CARDS from 'server/cards'
import Strengths from 'server/const/strengths'
import {
	getPlayerActiveRow,
	getOpponentActiveRow,
	getMultiplier,
} from '../game-selectors'
import css from './attack-modal.module.css'

import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getPlayerStateById,
} from 'logic/game/game-selectors'
import {startAttack} from 'logic/game/game-actions'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	// TODO - This whole file needs to be rafactored
	const dispatch = useDispatch()
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const availableActions = useSelector(getAvailableActions)
	const playerId = useSelector(getPlayerId)
	const playerState = useSelector(getPlayerStateById(playerId))
	const singleUseCard = playerState?.board.singleUseCard
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

	// const playerEffectInfo = activeRow.effectCard
	// 	? (TYPED_CARDS[activeRow.effectCard.cardId] as EffectCardT)
	// 	: null
	const opponentEffectInfo = opponentRow.effectCard
		? (TYPED_CARDS[opponentRow.effectCard.cardId] as EffectCardT)
		: null
	const singleUseInfo = singleUseCard
		? (TYPED_CARDS[singleUseCard.cardId] as EffectCardT)
		: null

	const suAttackInfo =
		singleUseInfo && singleUseInfo.damage
			? {
					name: singleUseInfo.name,
					damage: singleUseInfo.damage.target || 0,
					afkDamage: singleUseInfo.damage.afkTarget || 0,
			  }
			: null

	const protectionAmount =
		suAttackInfo && singleUseInfo?.id === 'golden_axe'
			? 0
			: opponentEffectInfo?.protection?.target || 0

	const hasWeakness = Strengths[playerHermitInfo.hermitType].includes(
		opponentHermitInfo.hermitType
	)

	const handleAttack = (type: 'zero' | 'primary' | 'secondary') => {
		dispatch(startAttack(type))
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
		const baseDamage = icon ? 0 : attackInfo.damage
		const totalDamage = Math.max(
			baseDamage +
				(suAttackInfo ? suAttackInfo.damage : 0) +
				(hasWeakness && baseDamage > 0 ? 20 : 0) -
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
								<div className={css.damageAmount}>
									{suAttackInfo.damage}
									{suAttackInfo?.afkDamage ? (
										<>({suAttackInfo.afkDamage})</>
									) : null}
								</div>
							</>
						) : null}

						{hasWeakness && baseDamage > 0 ? (
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
