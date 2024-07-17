import {useSelector} from 'react-redux'
import {LocalGameState, LocalPlayerState} from 'common/types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'
import css from './board.module.scss'
import BoardRow from './board-row'
import PlayerInfo from '../player-info'
import Timer from '../timer'
import Actions from '../actions/actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import MobileActions from '../actions/mobile-actions'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {SlotTypeT} from 'common/types/cards'
import { SlotEntity } from 'common/entities'

type Props = {
	onClick: (pickInfo: SlotInfo) => void
	localGameState: LocalGameState
}

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
		entity: SlotEntity,
		slotType: SlotTypeT,
		card: LocalCardInstance | null
	) => {
		onClick({slotEntity: entity, slotType: slotType, card: card})
	}

	const PlayerBoard = (player: LocalPlayerState, direction: 'left' | 'right') => {
		return (
			<div className={css.playerBoard} id={css[direction]}>
				{player.board.rows.map((row) => {
					return (
						<BoardRow
							key={row.entity}
							rowState={row}
							active={row.entity === player.board.activeRow}
							onClick={handleRowClick}
							type={direction}
							statusEffects={localGameState.statusEffects}
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
