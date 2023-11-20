import {useSelector} from 'react-redux'
import {LocalGameState, LocalPlayerState, RowState} from 'common/types/game-state'
import {PickedSlotT} from 'common/types/pick-process'
import {getPlayerId} from 'logic/session/session-selectors'
import css from './board.module.scss'
import BoardRow from './board-row'
import PlayerInfo from '../player-info'
import Timer from '../timer'
import Actions from '../actions/actions'
import {CARDS} from 'common/cards'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import BattleLog from '../../game/battle-log'
import MobileActions from '../actions/mobile-actions'

type Props = {
	onClick: (meta: PickedSlotT) => void
	localGameState: LocalGameState
}

// TODO - Don't allow clicking on slots on the other side
// TODO - Use selectors instead of passing gameState
function Board({onClick, localGameState}: Props) {
	const settings = useSelector(getSettings)
	const playerId = useSelector(getPlayerId)
	const player = localGameState.players[playerId]
	const opponent = localGameState.players[localGameState.opponentPlayerId]
	const side = settings.gameSide
	const leftPlayer = side === 'Left' ? player : opponent
	const rightPlayer = side === 'Right' ? player : opponent

	const handleRowClick = (playerId: string, rowIndex: number, rowState: RowState, meta: any) => {
		onClick({
			playerId,
			slot: {
				type: meta.slotType,
				index: meta.slotIndex,
				card: meta.card,
				info: meta.card ? CARDS[meta.card.cardId] : null,
			},
			row: {
				index: rowIndex,
				state: rowState,
			},
		})
	}

	const PlayerBoard = (player: LocalPlayerState, direction: 'left' | 'right') => {
		const rows = player.board.rows
		const boardArray = new Array(5).fill(null)

		return (
			<div className={css.playerBoard} id={css[direction]}>
				{boardArray.map((_, index) => {
					if (!rows[index]) throw new Error('Rendering board row failed!')
					return (
						<BoardRow
							key={index}
							rowState={rows[index]}
							active={index === player.board.activeRow}
							onClick={handleRowClick.bind(null, player.id, index, rows[index])}
							type={direction}
						/>
					)
				})}
			</div>
		)
	}

	return (
		<div className={css.gameBoard}>
			<div className={css.playerInfoSection}>
				<PlayerInfo player={leftPlayer} direction="left" />
				<Timer />
				<PlayerInfo player={rightPlayer} direction="right" />
			</div>

			<div className={css.actualBoard}>
				<BattleLog player={player.id} />
				{PlayerBoard(leftPlayer, 'left')}
				<Actions localGameState={localGameState} onClick={onClick} id={css.actions} />
				{PlayerBoard(rightPlayer, 'right')}
			</div>

			<MobileActions localGameState={localGameState} onClick={onClick} id={css.actions} />
		</div>
	)
}

export default Board
