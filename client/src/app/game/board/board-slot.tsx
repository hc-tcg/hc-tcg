import classnames from 'classnames'
import CARDS from 'common/cards'
import Card from 'components/card'
import {SlotTypeT} from 'common/types/pick-process'
import {CardT} from 'common/types/game-state'
import {RowState} from 'common/types/game-state'
import css from './board.module.css'
import HermitCard from 'common/cards/card-plugins/hermits/_hermit-card'
import EffectCard from 'common/cards/card-plugins/effects/_effect-card'
import SingleUseCard from 'common/cards/card-plugins/single-use/_single-use-card'
import ItemCard from 'common/cards/card-plugins/items/_item-card'
import HealthCard from 'common/cards/card-plugins/health/_health-card'

export type SlotProps = {
	type: SlotTypeT
	onClick?: () => void
	card: CardT | null
	rowState?: RowState
	active?: boolean
}
const Slot = ({type, onClick, card, rowState, active}: SlotProps) => {
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
	return (
		<div
			onClick={onClick}
			className={classnames(css.slot, {
				[css.available]: !!onClick,
				[css[type]]: true,
				[css.empty]: !cardInfo,
				[css.afk]: cardInfo?.type === 'hermit' && !active,
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
			) : (
				<img draggable="false" className={css.frame} src="/images/frame.png" />
			)}
		</div>
	)
}

export default Slot
