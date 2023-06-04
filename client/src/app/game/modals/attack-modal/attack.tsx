import classnames from 'classnames'
import {useSelector} from 'react-redux'
import {HERMIT_CARDS, EFFECT_CARDS, SINGLE_USE_CARDS} from 'common/cards'
import {HermitTypeT} from 'common/types/cards'
import Strengths from 'server/const/strengths'
import {getPlayerActiveRow, getOpponentActiveRow} from '../../game-selectors'
import {getPlayerState, getOpponentState} from 'logic/game/game-selectors'
import {HermitAttackInfo} from 'common/types/cards'
import valueModifiers from './value-modifiers'
import css from './attack-modal.module.css'

type Props = {
	attackInfo: HermitAttackInfo | null
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

	const extraKey =
		playerHermitInfo.hermitType + '_' + opponentHermitInfo.hermitType
	const hasExtraWeakness =
		!!currentPlayer?.custom['potion_of_weakness']?.[extraKey]
	const hasWeakness =
		Strengths[playerHermitInfo.hermitType as HermitTypeT]?.includes(
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
		value?: number
	) => {
		const min =
			info.min !== -1 ? ((value || 0) + info.min) * info.multiplier : '∞'
		const max =
			info.max !== -1 ? ((value || 0) + info.max) * info.multiplier : '∞'
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
				modifiedAttackInfo['effect'][key] *
					modifiedAttackInfo['effect'].multiplier -
				modProtection * modifiedAttackInfo['protection'].multiplier,
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

	if (opponentEffectInfo && modifiedAttackInfo.protection.max) {
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
					{getDamagaValue(modifiedAttackInfo.protection)}
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
