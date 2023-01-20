import Modal from 'components/modal'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'
import {CardInfoT, EffectCardT, HermitCardT} from 'types/cards'
import classnames from 'classnames'
import CARDS from 'server/cards'
import DAMAGE from 'server/const/damage'
import Strengths from 'server/cards/strengths'
import {getActiveRow, getOpponentActiveRow} from '../game-selectors'
import css from './attack-modal.module.css'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

type Props = {
	closeModal: () => void
}
function AttackModal({closeModal}: Props) {
	const dispatch = useDispatch()
	const activeRow = useSelector(getActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const singleUseCard = useSelector((state: RootState) => {
		if (!state.gameState) return null
		const {players, turnPlayerId} = state.gameState
		if (!players || !turnPlayerId) return null
		return players[turnPlayerId].board.singleUseCard
	})

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
	const opponentEffectInfo = opponentRow.effectCard
		? TYPED_CARDS[opponentRow.effectCard.cardId]
		: null
	const singleUseInfo = singleUseCard
		? (TYPED_CARDS[singleUseCard.cardId] as EffectCardT)
		: null

	const suAttackInfo = singleUseInfo
		? {
				name: singleUseInfo.name,
				damage: 20,
		  }
		: null

	const handleAttack = (type: 'zero' | 'primary' | 'secondary') => {
		// TODO - use DAMAGES..afkTarget
		const damageInfo = singleUseInfo && DAMAGE[singleUseInfo.id]
		if (damageInfo?.afkTarget) {
			dispatch({
				type: 'SET_PICK_PROCESS',
				payload: 'pick_afk',
				callback: (result: any) => {
					console.log('PROCESS: ', result)
					dispatch({type: 'ATTACK', payload: {type, singleUsePick: result}})
				},
			})
		} else {
			dispatch({type: 'ATTACK', payload: {type}})
		}
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
						<span className={css.damage}>{attackInfo.damage}</span>
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
								{attackInfo.damage}
							</>
						)}
						{singleUseInfo ? (
							<>
								{!icon ? <span> + </span> : null}
								<img
									src={`/images/effects/${singleUseInfo?.id}.png`}
									width="16"
									height="16"
								/>
								20
							</>
						) : null}

						{Strengths[playerHermitInfo.hermitType].includes(
							opponentHermitInfo.hermitType
						) ? (
							<>
								<span> + </span>
								<img src={`/images/weakness.png`} width="16" height="16" />
								20
							</>
						) : null}
						{opponentEffectInfo ? (
							<>
								<span> - </span>
								<img
									src={`/images/effects/${opponentEffectInfo.id}.png`}
									width="16"
									height="16"
								/>
								10
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
				{singleUseInfo
					? renderAttack(
							suAttackInfo,
							effectAttack,
							`/images/effects/${singleUseInfo.id}.png`
					  )
					: null}
				{renderAttack(playerHermitInfo.primary, primaryAttack)}
				{renderAttack(playerHermitInfo.secondary, secondaryAttack)}
			</div>
		</Modal>
	)
}

export default AttackModal
