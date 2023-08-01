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

export type SlotProps = {
	type: SlotTypeT
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
	cssId?: string
}
const Slot = ({type, onClick, card, rowState, active, cssId}: SlotProps) => {
	let cardInfo = card?.cardId
		? (CARDS[card.cardId] as HermitCard | EffectCard | SingleUseCard | ItemCard | HealthCard)
		: null
	if (type === 'health' && rowState?.health) {
		cardInfo = {
			type: 'health',
			health: rowState.health,
		} as HealthCard
	}

	const ailments = Array.from(new Set(rowState?.ailments.map((a) => a.id) || []))
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
				<>
					<Card card={cardInfo} />
					{type === 'health' &&
						ailments.map((id) => {
							const cssClass = css[id + 'Ailment']
							if (!cssClass) return null
							return <div key={id} className={cssClass} />
						})}
				</>
			) : type === 'health' ? null : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
		</div>
	)
}

export default Slot
