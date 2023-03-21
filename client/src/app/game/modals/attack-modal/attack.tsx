import classnames from 'classnames'
import {useSelector} from 'react-redux'
import {HERMIT_CARDS, EFFECT_CARDS, SINGLE_USE_CARDS} from 'server/cards'
import Strengths from 'server/const/strengths'
import {getPlayerActiveRow, getOpponentActiveRow} from '../../game-selectors'
import {getPlayerState, getOpponentState} from 'logic/game/game-selectors'
import {HermitAttackT} from 'common/types/cards'
import valueModifiers from './value-modifiers'
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
	const currentPlayer = useSelector(getPlayerState)
	const opponentPlayer = useSelector(getOpponentState)
	const singleUseCard = currentPlayer?.board.singleUseCard

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

	const protectionAmount = suAttackInfo
		? 0
		: opponentEffectInfo?.protection?.target || 0

	const extraKey =
		playerHermitInfo.hermitType + '_' + opponentHermitInfo.hermitType
	const hasExtraWeakness =
		!!currentPlayer?.custom['potion_of_weakness']?.[extraKey]
	const hasWeakness =
		Strengths[playerHermitInfo.hermitType]?.includes(
			opponentHermitInfo.hermitType
		) || hasExtraWeakness

	const baseDamage = attackInfo?.damage || 0
	const weaknessDamage = hasWeakness && baseDamage > 0 ? 20 : 0

	const makeAttackMod = () => ({
		multiplier: 1,
		min: 0,
		max: 0,
	})

	const modifiedAttackInfo = valueModifiers.reduce(
		(result, vm) => {
			vm({currentPlayer, opponentPlayer, singleUseInfo}, result)
			return result
		},
		{
			hermit: makeAttackMod(),
			weakness: makeAttackMod(),
			effect: makeAttackMod(),
			afkEffect: makeAttackMod(),
			protection: makeAttackMod(),
		}
	)

	const getDamagaValue = (
		info: ReturnType<typeof makeAttackMod>,
		value: number
	) => {
		const min = info.min !== -1 ? (value + info.min) * info.multiplier : '∞'
		const max = info.max !== -1 ? (value + info.max) * info.multiplier : '∞'
		if (min !== max) return `${min}-${max}`
		return `${max}`
	}

	const totalMinMax = (['min', 'max'] as const).map((key) => {
		let modProtection = modifiedAttackInfo['protection'][key]
		if (modProtection === -1) modProtection = 10000
		return Math.max(
			(baseDamage + modifiedAttackInfo['hermit'][key]) *
				modifiedAttackInfo['hermit'].multiplier +
				(weaknessDamage + modifiedAttackInfo['weakness'][key]) *
					modifiedAttackInfo['weakness'].multiplier +
				((suAttackInfo?.damage || 0) + modifiedAttackInfo['effect'][key]) *
					modifiedAttackInfo['effect'].multiplier -
				(protectionAmount + modProtection) *
					modifiedAttackInfo['protection'].multiplier,
			0
		)
	})

	const attackParts = []

	if (attackInfo) {
		attackParts.push(
			<div key="hermit" className={css.attackPart}>
				<div className={css.hermitDamage}>
					<img src={`/images/hermits-nobg/${hermitFullName}.png`} width="32" />
				</div>
				<div className={css.damageAmount}>
					{getDamagaValue(modifiedAttackInfo.hermit, attackInfo.damage)}
				</div>
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
					{getDamagaValue(modifiedAttackInfo.effect, suAttackInfo.damage)}
					{suAttackInfo.afkDamage ? (
						<>
							(
							{getDamagaValue(
								modifiedAttackInfo.afkEffect,
								suAttackInfo.afkDamage
							)}
							)
						</>
					) : null}
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
				<div className={css.damageAmount}>
					{getDamagaValue(modifiedAttackInfo.weakness, weaknessDamage)}
				</div>
			</div>
		)
	}

	if (
		opponentEffectInfo &&
		(protectionAmount || modifiedAttackInfo.protection.max)
	) {
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
				<div className={css.damageAmount}>
					{getDamagaValue(modifiedAttackInfo.protection, protectionAmount)}
				</div>
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
						{totalMinMax[0] !== totalMinMax[1] ? <>{totalMinMax[0]}-</> : null}
						{totalMinMax[1]}
					</span>
				</div>
				<div className={css.description}>{attackParts}</div>
			</div>
		</div>
	)
}

export default Attack
