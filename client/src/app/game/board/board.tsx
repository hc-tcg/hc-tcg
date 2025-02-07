import {PlayerEntity, SlotEntity} from 'common/entities'
import {SlotTypeT} from 'common/types/cards'
import {LocalGameState, LocalPlayerState} from 'common/types/game-state'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {getOpponentState, getPlayerState} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import Actions from '../actions/actions'
import MobileActions from '../actions/mobile-actions'
import PlayerInfo from '../player-info'
import Timer from '../timer'
import BoardRow from './board-row'
import css from './board.module.scss'

type Props = {
	onClick: (
		pickInfo: SlotInfo,
		player: PlayerEntity,
		row?: number,
		index?: number,
	) => void
	localGameState: LocalGameState
	gameEndButton: () => void
}

// TODO - Use selectors instead of passing gameState
function Board({onClick, localGameState, gameEndButton}: Props) {
	const settings = useSelector(getSettings)
	const player = useSelector(getPlayerState)
	const opponent = useSelector(getOpponentState)
	const side = settings.gameSide
	const leftPlayer = side === 'Left' ? player : opponent
	const rightPlayer = side === 'Right' ? player : opponent

	const handleRowClick = (
		rowIndex: number,
		player: PlayerEntity,
		entity: SlotEntity,
		slotType: SlotTypeT,
		card: LocalCardInstance | null,
		index: number,
	) => {
		onClick(
			{slotEntity: entity, slotType: slotType, card: card},
			player,
			rowIndex,
			index,
		)
	}

	const PlayerBoard = (
		player: LocalPlayerState,
		direction: 'left' | 'right',
	) => {
		return (
			<div className={css.playerBoard} id={css[direction]}>
				{player.board.rows.map((row, rowIndex) => {
					return (
						<BoardRow
							key={row.entity}
							player={
								direction === 'left' ? leftPlayer?.entity : rightPlayer.entity
							}
							rowState={row}
							active={row.entity === player.board.activeRow}
							onClick={(...args) =>
								handleRowClick(rowIndex, player.entity, ...args)
							}
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
				<Actions
					localGameState={localGameState}
					onClick={(value) => onClick(value, player.entity)}
					id={css.actions}
					gameEndButton={gameEndButton}
				/>
				{PlayerBoard(rightPlayer, 'right')}
			</div>

			<MobileActions
				localGameState={localGameState}
				onClick={(value) => onClick(value, player.entity)}
				id={css.actions}
			/>
		</div>
	)
}

export default Board
