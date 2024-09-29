import classNames from 'classnames'
import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import MenuLayout from 'components/menu-layout'
import Spinner from 'components/spinner'
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

	if (status === 'private_lobby') {
		return (
			<MenuLayout
				back={handleCancel}
				title="Private Game Lobby"
				returnText="Settings"
				className={classNames(css.privateLobby)}
			>
				<div className={css.privateLobbyLeft}>
					<p>Opponent Code</p>
					<div className={css.code} onClick={handleCodeClick}>
						{gameCode}
					</div>
					<p>Spectator Code</p>
					<div className={css.code} onClick={handleSpectatorCodeClick}>
						{spectatorCode}
					</div>
				</div>

				<div className={css.privateLobbyRight}>
					<form className={css.codeInput} onSubmit={handleCodeSubmit}>
						<label htmlFor="gameCode">Enter game or spectator code:</label>
						<input
							className={invalidCode ? css.invalidCode : ''}
							name="gameCode"
							id="gameCode"
							autoFocus
						/>
						{invalidCode && <ErrorBanner>Invalid Code</ErrorBanner>}
						<div className={css.options}>
							<Button type="submit" variant="stone">
								Join
							</Button>
						</div>
					</form>
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
			case 'loading':
				return (
					<>
						<Spinner />
						<p>Loading</p>
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
