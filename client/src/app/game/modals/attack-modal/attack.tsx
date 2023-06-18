import classnames from 'classnames'
import {HermitAttackInfo} from 'common/types/cards'
import css from './attack-modal.module.css'

type Props = {
	attackInfo: HermitAttackInfo | null
	onClick: () => void
	icon: string
	name: string
	extra?: boolean
}

const Attack = ({attackInfo, onClick, name, icon, extra}: Props) => {
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
					{name} - {' '}
					<span className={classnames(css.damage, {
							[css.specialMove]: !!attackInfo?.power,
						})}>
					{attackInfo?.damage}
					</span>
				</div>
				{attackInfo?.power &&
					<div className={css.specialMoveDescription}>
						{attackInfo?.power}
					</div>}
			</div>
		</div>
	)
}

export default Attack
