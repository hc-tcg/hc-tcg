import CARDS from 'server/cards'
import {CardT} from 'types/cards'
import Card from 'components/card'
import css from './board.module.css'
import classnames from 'classnames'

const TYPED_CARDS = CARDS as Record<string, CardT>

type SlotProps = {
	type: 'item' | 'hermit' | 'effect' | 'health'
}
const Slot = ({type}: SlotProps) => {
	return (
		<div className={classnames(css.slot, {[css[type]]: true})}>
			<img src="/images/frame.png" />
		</div>
	)
}

type HermitRowProps = {
	type: 'left' | 'right'
}
const HermitRow = ({type}: HermitRowProps) => {
	const slots = [
		<Slot type="item" />,
		<Slot type="item" />,
		<Slot type="item" />,
		<Slot type="effect" />,
		<Slot type="hermit" />,
		<Slot type="health" />,
	]
	if (type === 'right') slots.reverse()
	return <div className={css.hermitRow}>{slots}</div>
}

type Props = {}
function Board(props: Props) {
	const leftPlayer = Array(5).fill(<HermitRow type="left" />)
	const rightPlayer = Array(5).fill(<HermitRow type="right" />)
	return (
		<div className={css.board}>
			<div className={css.leftPlayer}>{leftPlayer}</div>
			<div className={css.rightPlayer}>{rightPlayer}</div>
		</div>
	)
}

export default Board
