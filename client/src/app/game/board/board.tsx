import {useSelector} from 'react-redux'
import {CardT, LocalGameState, LocalPlayerState, RowState} from 'common/types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'
import css from './board.module.scss'
import BoardRow from './board-row'
import PlayerInfo from '../player-info'
import Timer from '../timer'
import Actions from '../actions/actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import MobileActions from '../actions/mobile-actions'
import {PickInfo, SlotInfo} from 'common/types/server-requests'

type Props = {
	onClick: (pickInfo: PickInfo) => void
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

	const handleRowClick = (
		playerId: string,
		rowIndex: number,
		card: CardT | null,
		slot: SlotInfo
	) => {
		onClick({
			playerId,
			rowIndex,
			card,
			slot,
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
							onClick={handleRowClick.bind(null, player.id, index)}
							type={direction}
							ailments={localGameState.ailments}
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
				{PlayerBoard(leftPlayer, 'left')}
				<Actions localGameState={localGameState} onClick={onClick} id={css.actions} />
				{PlayerBoard(rightPlayer, 'right')}
			</div>

			<MobileActions localGameState={localGameState} onClick={onClick} id={css.actions} />
		</div>
	)
}

export default Board
