import classnames from 'classnames'
import {useSelector} from 'react-redux'
import {HERMIT_CARDS, EFFECT_CARDS, SINGLE_USE_CARDS} from 'server/cards'
import Strengths from 'server/const/strengths'
import {
	getPlayerActiveRow,
	getOpponentActiveRow,
	getMultiplier,
} from '../../game-selectors'
import {getPlayerId} from 'logic/session/session-selectors'
import {getPlayerStateById} from 'logic/game/game-selectors'
import {HermitAttackT} from 'common/types/cards'
import css from './attack-modal.module.css'

type Props = {
	attackInfo: HermitAttackT | null
	onClick: () => void
	icon: string
	name: string
	extra?: boolean
}

const Attack = ({attackInfo, onClick, name, icon, extra}: Props) => {
	const activeRow = useSelector(getPlayerActiveRow)
	const opponentRow = useSelector(getOpponentActiveRow)
	const playerId = useSelector(getPlayerId)
	const playerState = useSelector(getPlayerStateById(playerId))
	const singleUseCard = playerState?.board.singleUseCard
	const multiplier = useSelector(getMultiplier)

	if (!activeRow || !activeRow.hermitCard) return null
	if (!opponentRow || !opponentRow.hermitCard) return null

	const playerHermitInfo = HERMIT_CARDS[activeRow.hermitCard.cardId]
	const opponentHermitInfo = HERMIT_CARDS[opponentRow.hermitCard.cardId]
	const hermitFullName = playerHermitInfo.id.split('_')[0]

	const opponentEffectInfo = opponentRow.effectCard
		? EFFECT_CARDS[opponentRow.effectCard.cardId]
		: null
	const singleUseInfo = singleUseCard
		? SINGLE_USE_CARDS[singleUseCard.cardId]
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

	const extraKey =
		playerHermitInfo.hermitType + '_' + opponentHermitInfo.hermitType
	const hasExtraWeakness =
		!!playerState?.custom['potion_of_weakness']?.[extraKey]
	const hasWeakness =
		Strengths[playerHermitInfo.hermitType]?.includes(
			opponentHermitInfo.hermitType
		) || hasExtraWeakness

	const baseDamage = attackInfo?.damage || 0
	const totalDamage = Math.max(
		baseDamage +
			(suAttackInfo?.damage || 0) +
			(hasWeakness && baseDamage > 0 ? 20 : 0) -
			protectionAmount,
		0
	)

	const totalMinDamage =
		singleUseInfo?.id === 'anvil' ? totalDamage - 80 : totalDamage

	const attackParts = []

	if (attackInfo) {
		attackParts.push(
			<div key="hermit" className={css.attackPart}>
				<div className={css.hermitDamage}>
					<img src={`/images/hermits-nobg/${hermitFullName}.png`} width="32" />
				</div>
				<div className={css.damageAmount}>{attackInfo.damage}</div>
			</div>
		)
	}

	if (suAttackInfo) {
		if (attackParts.length) {
			attackParts.push(
				<div key="single-use-op" className={css.attackOperator}>
					+
				</div>
			)
		}
		attackParts.push(
			<div key="single-use" className={css.attackPart}>
				<img
					src={`/images/effects/${singleUseInfo?.id}.png`}
					width="16"
					height="16"
				/>
				<div className={css.damageAmount}>
					{singleUseInfo?.id === 'anvil' ? <>0/</> : null}
					{suAttackInfo.damage}
					{suAttackInfo.afkDamage ? <>({suAttackInfo.afkDamage})</> : null}
				</div>
			</div>
		)
	}

	if (hasWeakness && baseDamage > 0) {
		if (attackParts.length) {
			attackParts.push(
				<div key="weakness-op" className={css.attackOperator}>
					+
				</div>
			)
		}
		attackParts.push(
			<div key="weakness" className={css.attackPart}>
				<img src={`/images/weakness.png`} width="16" height="16" />
				<div className={css.damageAmount}>20</div>
			</div>
		)
	}

	if (opponentEffectInfo && protectionAmount) {
		if (attackParts.length) {
			attackParts.push(
				<div key="protection-op" className={css.attackOperator}>
					-
				</div>
			)
		}
		attackParts.push(
			<div key="protection" className={css.attackPart}>
				<img
					src={`/images/effects/${opponentEffectInfo.id}.png`}
					width="16"
					height="16"
				/>
				<div className={css.damageAmount}>{protectionAmount}</div>
			</div>
		)
	}

	return (
		<div
			key={name}
			className={classnames(css.attack, {[css.extra]: extra})}
			onClick={onClick}
		>
			<div
				className={classnames(css.icon, {
					[css.effectIcon]: !attackInfo,
					[css.hermitIcon]: !!attackInfo,
				})}
			>
				<img src={icon} />
			</div>
			<div className={css.info}>
				<div className={css.name}>
					{name} -{' '}
					<span
						className={classnames(css.damage, {
							[css.specialMove]: !!attackInfo?.power,
						})}
					>
						{totalMinDamage !== totalDamage ? <>{totalMinDamage}-</> : null}
						{totalDamage}
					</span>
					{multiplier !== null ? (
						<span className={css.multiplier}> x{multiplier}</span>
					) : null}
				</div>
				<div className={css.description}>{attackParts}</div>
			</div>
		</div>
	)
}

export default Attack
