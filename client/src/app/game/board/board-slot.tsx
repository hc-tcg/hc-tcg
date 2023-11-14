import classnames from 'classnames'
import {CARDS} from 'common/cards'
import Card from 'components/card'
import {SlotTypeT} from 'common/types/pick-process'
import {CardT, RowState} from 'common/types/game-state'
import css from './board.module.scss'
import HermitCard from 'common/cards/base/hermit-card'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import ItemCard from 'common/cards/base/item-card'
import HealthCard from 'common/cards/base/health-card'
import {AilmentT} from 'common/types/game-state'
import Ailment from 'components/ailments/ailment'
import {AILMENT_CLASSES} from 'common/ailments'

export type SlotProps = {
	type: SlotTypeT
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
	cssId?: string
	ailments: Array<AilmentT>
}
const Slot = ({type, onClick, card, rowState, active, cssId, ailments}: SlotProps) => {
	let cardInfo = card?.cardId
		? (CARDS[card.cardId] as HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard)
		: null
	if (type === 'health' && rowState?.health) {
		cardInfo = new HealthCard({
			id: 'health',
			name: 'Health Card',
			rarity: 'common',
			health: rowState.health,
		})
	}

	const renderAilments = (cleanedAilments: AilmentT[]) => {
		return (
			<div className={css.ailmentContainer}>
				{cleanedAilments.map((a) => {
					const ailment = AILMENT_CLASSES[a.ailmentId]
					if (!ailment) return null
					if (ailment.damageEffect == true) return null
					return <Ailment ailment={ailment} duration={a.duration} />
				})}
			</div>
		)
	}
	const renderDamageAilments = (cleanedAilments: AilmentT[] | null) => {
		return (
			<div className={css.damageAilmentContainer}>
				{cleanedAilments
					? cleanedAilments.map((a) => {
							const ailment = AILMENT_CLASSES[a.ailmentId]
							if (!ailment) return null
							if (ailment.damageEffect == false) return null
							return <Ailment ailment={ailment} />
					  })
					: null}
			</div>
		)
	}

	const hermitAilments = Array.from(
		new Set(
			ailments
				.filter((a) => rowState?.hermitCard && a.targetInstance == rowState.hermitCard.cardInstance)
				.map((a) => a) || []
		)
	)
	const effectAilments = Array.from(
		new Set(
			ailments.filter(
				(a) => rowState?.effectCard && a.targetInstance == rowState.effectCard.cardInstance
			) || []
		)
	)
	const frameImg = type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	return (
		<div
			onClick={onClick}
			id={css[cssId || 'slot']}
			className={classnames(css.slot, {
				[css.available]: !!onClick,
				[css[type]]: true,
				[css.empty]: !cardInfo,
				// [css.afk]: cardInfo && !active,
				// [css.afk]: cardInfo?.type === 'hermit' && !active,
				[css.afk]: !active && type !== 'single_use',
			})}
		>
			{cardInfo ? (
				<div className={css.cardWrapper}>
					<Card card={cardInfo} />
					{type === 'health'
						? renderAilments(hermitAilments)
						: type === 'effect'
						? renderAilments(effectAilments)
						: null}
					{type === 'health'
						? renderDamageAilments(hermitAilments)
						: type === 'effect'
						? renderDamageAilments(effectAilments)
						: renderDamageAilments(null)}
				</div>
			) : type === 'health' ? null : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
		</div>
	)
}

export default Slot
