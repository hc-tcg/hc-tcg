import classnames from 'classnames'
import CARDS from 'server/cards'
import Card from 'components/card'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import {BoardRowT} from 'types/game-state'
import css from './board.module.css'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

export type SlotType = 'item' | 'hermit' | 'effect' | 'health' | 'single_use'
export type SlotProps = {
	type: SlotType
	onClick?: () => void
	card: CardT | null
	rowState?: BoardRowT
	active?: boolean
}
const Slot = ({type, onClick, card, rowState, active}: SlotProps) => {
	let cardInfo = card?.cardId ? TYPED_CARDS[card.cardId] : null
	if (type === 'health' && rowState?.health) {
		cardInfo = {
			name: rowState.health + ' Health',
			rarity: 'common',
			type: 'health',
			health: rowState.health,
			id: 'health_' + rowState.health,
		}
	}
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
					rowState?.ailments.find(a => a.id == "fire") ? (
						<div className={css.fireAilment} />
					) : null}

					{type === 'health' &&
					rowState?.ailments.find(a => a.id == "poison") ? (
						<div className={css.poisonAilment} />
					) : null}

					{type === 'health' &&
					rowState?.ailments.find(a => a.id == "sleeping") ? (
						<div className={css.sleepingAilment} />
					) : null}
				</>
			) : (
				<img draggable="false" className={css.frame} src="/images/frame.png" />
			)}
		</div>
	)
}

export default Slot
