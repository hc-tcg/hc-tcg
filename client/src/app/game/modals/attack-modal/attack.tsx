import cn from 'classnames'
import {HermitAttackInfo} from 'common/types/cards'
import css from '../game-modals.module.scss'

type Props = {
	attackInfo: HermitAttackInfo | null
	onClick: () => void
	icon: string
	name: string
	extra?: boolean
}

const Attack = ({attackInfo, onClick, name, icon, extra}: Props) => {
	return (
		<button key={name} className={cn(css.attack, {[css.extra]: extra})} onClick={onClick}>
			{/* PORTRAIT */}
			<div
				className={cn(css.portrait, {
					[css.effectIcon]: !attackInfo,
					[css.hermitIcon]: !!attackInfo,
				})}
			>
				<img src={icon} />
			</div>

			{/* ATTACK NAME */}
			<div className={css.info}>
				<p className={css.name}>
					{name} -{' '}
					<span
						className={cn(css.damage, {
							[css.specialMove]: !!attackInfo?.power,
						})}
					>
						{attackInfo?.damage}
						{attackInfo?.power && (
							<div className={css.specialMoveDescription}>{attackInfo?.power}</div>
						)}
					</span>
				</p>
			</div>
		</button>
	)
}

export default Attack
