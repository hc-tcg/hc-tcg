import {CARDS} from 'common/cards'
import {Card as CardType} from 'common/cards/types'
import {GameHistory as GameHistoryT} from 'common/types/database'
import {sortCards} from 'common/utils/cards'
import Button from 'components/button'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages} from 'logic/messages'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './main-menu.module.scss'

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
			id: game.id,
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
									src={`https://mc-heads.net/head/${game.firstPlayer.minecraftName}/left`}
									alt="player head"
								/>
							</div>
							<div>
								{game.firstPlayer.uuid === database.userId
									? 'You'
									: game.firstPlayer.name}
								{game.firstPlayer.player === 'you' && (
									<Button
										onClick={() => {
											if (
												game.firstPlayer.player !== 'you' ||
												!game.firstPlayer.deck
											)
												return
											setScreenshotDeckModalContents(
												sortCards(
													parseDeckCards(
														game.firstPlayer.deck.cards.map(
															(card) => card.props.id,
														),
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
									: game.secondPlayer.name}
								{game.secondPlayer.player === 'you' && (
									<Button
										onClick={() => {
											if (
												game.secondPlayer.player !== 'you' ||
												!game.secondPlayer.deck
											)
												return
											setScreenshotDeckModalContents(
												sortCards(
													parseDeckCards(
														game.secondPlayer.deck.cards.map(
															(card) => card.props.id,
														),
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
									src={`https://mc-heads.net/head/${game.firstPlayer.minecraftName}/left`}
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
