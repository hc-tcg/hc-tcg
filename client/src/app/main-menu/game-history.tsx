import MenuLayout from 'components/menu-layout'
import css from './main-menu.module.scss'
import {useDispatch, useSelector} from 'react-redux'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import Button from 'components/button'
import {ScreenshotDeckModal} from 'components/import-export'
import {useState} from 'react'
import {Card as CardType} from 'common/cards/types'
import {sortCards} from 'common/utils/cards'
import {CARDS} from 'common/cards'
import {localMessages} from 'logic/messages'
import {GameHistory as GameHistoryT} from 'common/types/database'

type Props = {
	setMenuSection: (section: string) => void
}

const parseDeckCards = (cards: Array<string>) => {
	return cards.map((card) => CARDS[card])
}

function GameHistory({setMenuSection}: Props) {
	const database = useSelector(getLocalDatabaseInfo)
	const games = database.gameHistory
	const dispatch = useDispatch()

	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<CardType> | null>(null)

	const handleReplayGame = (game: GameHistoryT) => {
		dispatch({
			type: localMessages.MATCHMAKING_REPLAY_GAME,
			firstPlayer: game.firstPlayer,
			secondPlayer: game.secondPlayer,
			replay: game.replay,
			seed: game.seed,
		})
	}

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('settings')}
				title="Game History"
				returnText="More"
				className={css.settingsMenu}
			>
				<div className={css.gamesArea}>
					{games.map((game) => (
						<div className={css.gameHistoryBox}>
							<div>
								<img
									className={css.playerHead}
									src={`https://mc-heads.net/head/${game.firstPlayer.model.minecraftName}/left`}
									alt="player head"
								/>
							</div>
							<div>
								{game.firstPlayer.uuid === database.userId
									? 'You'
									: game.firstPlayer.model.name}
								{game.firstPlayer.uuid === database.userId && (
									<Button
										onClick={() => {
											setScreenshotDeckModalContents(
												sortCards(
													parseDeckCards(
														game.firstPlayer.deck as Array<string>,
													),
												),
											)
										}}
									>
										View
									</Button>
								)}
							</div>
							<div>
								{game.secondPlayer.uuid === database.userId
									? 'You'
									: game.secondPlayer.model.name}
								{game.secondPlayer.uuid === database.userId && (
									<Button
										onClick={() => {
											setScreenshotDeckModalContents(
												sortCards(
													parseDeckCards(
														game.secondPlayer.deck as Array<string>,
													),
												),
											)
										}}
									>
										View
									</Button>
								)}
							</div>
							<div>
								<img
									className={css.playerHead}
									src={`https://mc-heads.net/head/${game.firstPlayer.model.minecraftName}/left`}
									alt="player head"
								/>
							</div>
							<Button onClick={() => handleReplayGame(game)}>
								Watch Replay
							</Button>
						</div>
					))}
				</div>
			</MenuLayout>
			{screenshotDeckModalContents !== null && (
				<ScreenshotDeckModal
					setOpen={screenshotDeckModalContents !== null}
					cards={screenshotDeckModalContents}
					onClose={() => setScreenshotDeckModalContents(null)}
				/>
			)}
		</>
	)
}

export default GameHistory
