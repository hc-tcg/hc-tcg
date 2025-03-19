import {PlayerEntity, RowEntity, SlotEntity} from 'common/entities'
import {SlotTypeT} from 'common/types/cards'
import {LocalCardInstance, SlotInfo} from 'common/types/server-requests'
import {
	getOpponentEntity,
	getPlayerEntity,
	getPlayerStateByEntity,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useSelector} from 'react-redux'
import {RootState} from 'store'
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
	gameOver: boolean
	gameEndButton: () => void
}

function getPlayerRowEntities(playerEntity: PlayerEntity) {
	return (state: RootState) => {
		return getPlayerStateByEntity(playerEntity)(state).board.rows.map(
			(row) => row.entity,
		)
	}
}

// TODO - Use selectors instead of passing gameState
function Board({onClick, gameOver, gameEndButton}: Props) {
	const settings = useSelector(getSettings)
	const playerEntity = useSelector(getPlayerEntity)
	const opponentEntity = useSelector(getOpponentEntity)
	const playerRows = useSelector(getPlayerRowEntities(playerEntity))
	const opponentRows = useSelector(getPlayerRowEntities(opponentEntity!))
	const side = settings.gameSide
	const leftPlayerEntity = side === 'Left' ? playerEntity : opponentEntity
	const rightPlayerEntity = side === 'Right' ? playerEntity : opponentEntity
	const leftPlayerRows = side === 'Left' ? playerRows : opponentRows
	const rightPlayerRows = side === 'Right' ? playerRows : opponentRows

	if (!leftPlayerEntity) throw new Error('There should be a left player entity')
	if (!rightPlayerEntity)
		throw new Error('There should be a right player entity')

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
		playerEntity: PlayerEntity,
		rows: RowEntity[],
		direction: 'left' | 'right',
	) => {
		return (
			<div className={css.playerBoard} id={css[direction]}>
				{rows.map((row, rowIndex) => {
					return (
						<BoardRow
							key={row}
							boardForPlayerEntity={
								direction === 'left' ? leftPlayerEntity : rightPlayerEntity
							}
							rowEntity={row}
							onClick={(...args) =>
								handleRowClick(rowIndex, playerEntity, ...args)
							}
							type={direction}
							gameOver={gameOver}
						/>
					)
				})}
			</div>
		)
	}

	return (
		<div className={css.gameBoard}>
			<div className={css.playerInfoSection}>
				<PlayerInfo playerEntity={leftPlayerEntity} direction="left" />
				<Timer gameOver={gameOver} />
				<PlayerInfo playerEntity={rightPlayerEntity} direction="right" />
			</div>

			<div className={css.actualBoard}>
				{PlayerBoard(leftPlayerEntity, leftPlayerRows, 'left')}
				<Actions
					onClick={(value) => onClick(value, playerEntity)}
					id={css.actions}
					gameEndButton={gameEndButton}
					gameOver={gameOver}
				/>
				{PlayerBoard(rightPlayerEntity, rightPlayerRows, 'right')}
			</div>

			<MobileActions
				onClick={(value) => onClick(value, playerEntity)}
				id={css.actions}
				gameOver={gameOver}
			/>
		</div>
	)
}

export default Board
