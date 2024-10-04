import classNames from 'classnames'
import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import MenuLayout from 'components/menu-layout'
import Spinner from 'components/spinner'
import {CopyIcon} from 'components/svgs'
import TcgLogo from 'components/tcg-logo'
import {
	getGameCode,
	getInvalidCode,
	getSpectatorCode,
	getStatus,
} from 'logic/matchmaking/matchmaking-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import React from 'react'
import {useSelector} from 'react-redux'
import css from './match-making.module.scss'

function MatchMaking() {
	const dispatch = useMessageDispatch()
	const status = useSelector(getStatus)
	const gameCode = useSelector(getGameCode)
	const spectatorCode = useSelector(getSpectatorCode)
	const invalidCode = useSelector(getInvalidCode)

	const handleCancel = () => {
		dispatch({type: localMessages.MATCHMAKING_LEAVE})
	}

	const handleCodeSubmit = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const code = ev.currentTarget.gameCode.value.trim()
		dispatch({type: localMessages.MATCHMAKING_CODE_SET, code})
	}

	const handleCodeClick = () => {
		if (!gameCode) return
		navigator.clipboard.writeText(gameCode)
	}

	const handleSpectatorCodeClick = () => {
		if (!spectatorCode) return
		navigator.clipboard.writeText(spectatorCode)
	}

	if (status === 'private_lobby' || status === 'loading') {
		return (
			<MenuLayout
				back={handleCancel}
				title="Private Game Lobby"
				returnText="Main Menu"
				className={classNames(css.privateLobbyMenu)}
			>
				<div className={css.privateLobby}>
					<p>
						Share your opponent or spectator code, enter an opponent code to
						join a game, or enter a spectator code to specate a game.
					</p>
					<div className={css.privateJoinGrid}>
						<div className={css.privateLobbyLeft}>
							<p>Opponent Code</p>
							<div className={css.code} onClick={handleCodeClick}>
								<CopyIcon /> {gameCode}
							</div>
							<p>Spectator Code</p>
							<div className={css.code} onClick={handleSpectatorCodeClick}>
								<CopyIcon /> {spectatorCode}
							</div>
						</div>
						<form
							className={classNames(css.privateLobbyRight, css.codeInput)}
							onSubmit={handleCodeSubmit}
						>
							<label htmlFor="gameCode">Enter code:</label>
							<div className={css.joinButton}>
								<input
									className={invalidCode ? css.invalidCode : ''}
									name="gameCode"
									id="gameCode"
									autoFocus
								/>
								{status !== 'loading' && (
									<Button type="submit" variant="default">
										Join
									</Button>
								)}
								{status === 'loading' && (
									<div className={css.spinner}>
										<Spinner />
									</div>
								)}
							</div>
							<ErrorBanner hide={!invalidCode}>Invalid Code</ErrorBanner>
						</form>
					</div>
				</div>
			</MenuLayout>
		)
	}

	const Status = () => {
		switch (status) {
			default:
			case 'random_waiting':
				return (
					<>
						<Spinner />
						<p>Waiting for opponent</p>
						<Button variant="stone" onClick={handleCancel}>
							Cancel
						</Button>
					</>
				)
			case 'waiting_for_player':
			case 'waiting_for_player_as_spectator':
				return (
					<>
						<Spinner />
						<p>Waiting for second player</p>
						<div className={css.options}>
							<Button variant="stone" onClick={handleCancel}>
								Cancel
							</Button>
						</div>
					</>
				)
			case 'starting':
				return (
					<>
						<Spinner />
						<p>Starting Game</p>
					</>
				)
		}
	}

	return (
		<div className={css.body}>
			<TcgLogo />
			<div className={css.content}>
				<Status />
			</div>
		</div>
	)
}

export default MatchMaking
