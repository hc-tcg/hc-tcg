import classnames from 'classnames'
import CARDS from 'server/cards'
import Card from 'components/card'
import {CardInfoT} from 'types/cards'
import {BoardRowT} from 'types/game-state'
import css from './board.module.css'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

export type SlotType = 'item' | 'hermit' | 'effect' | 'health' | 'single_use'
export type SlotProps = {
	type: SlotType
	onClick: () => void
	cardId: string | null
	rowState?: BoardRowT
	active?: boolean
}
const Slot = ({type, onClick, cardId, rowState, active}: SlotProps) => {
	let card = cardId ? TYPED_CARDS[cardId] : null
	if (type === 'health' && rowState?.health) {
		card = {
			type: 'health',
			health: rowState.health,
			id: 'health_' + rowState.health,
		}
	}
	return (
		<div
			onClick={onClick}
			className={classnames(css.slot, {
				[css[type]]: true,
				[css.empty]: !card,
				[css.afk]: card?.type === 'hermit' && !active,
			})}
		>
			{card ? (
				<div className={css.cardWrapper}>
					<Card card={card} />
				</div>
			) : (
				<img draggable="false" className={css.frame} src="/images/frame.png" />
			)}
		</div>
	)
}

export default Slot
