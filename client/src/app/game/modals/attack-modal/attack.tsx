import cn from 'classnames'
import {HermitAttackInfo} from 'common/types/cards'
import css from '../game-modals.module.scss'

type SingleUseAttackInfo = {
	description: string
}

type Props = {
	attackInfo: HermitAttackInfo | SingleUseAttackInfo
	singleUseIcon?: string
	singleUseDamage?: string
	onClick: () => void
	icon: string
	name: string
	extra?: boolean
}

const Attack = ({
	attackInfo,
	singleUseIcon,
	singleUseDamage,
	onClick,
	name,
	icon,
	extra,
}: Props) => {
	let attackDescription
	let imageClass

	if ('damage' in attackInfo) {
		imageClass = css.hermitImage
		attackDescription = (
			<div className={css.info}>
				<p className={css.name}>
					{name} -{' '}
					<span
						className={cn(css.damage, {
							[css.specialMove]: !!attackInfo?.power,
						})}
					>
						{attackInfo?.damage}{' '}
					</span>
					{singleUseDamage && (
						<span>
							+ <span className={css.singleUseMove}>{singleUseDamage}</span>
						</span>
					)}
				</p>
				{attackInfo?.power && <p>{attackInfo?.power}</p>}{' '}
			</div>
		)
	} else {
		imageClass = css.effectImage
		attackDescription = (
			<div className={css.info}>
				<p className={css.name}>
					{name}{' '}
					{singleUseDamage && (
						<span>
							{' '}
							{' - '} <span className={css.singleUseMove}> {singleUseDamage} </span>{' '}
						</span>
					)}
				</p>
				{attackInfo.description}
			</div>
		)
	}

	return (
		<button key={name} className={cn(css.attack, {[css.extra]: extra})} onClick={onClick}>
			{/* PORTRAIT */}
			<div
				className={cn(css.portrait, {
					[css.effectIcon]: !attackInfo,
					[css.hermitIcon]: !!attackInfo,
				})}
			>
				<img src={icon} className={imageClass} />
			</div>

			{/* ATTACK NAME */}
			{attackDescription}
		</button>
	)
}

export default Attack
