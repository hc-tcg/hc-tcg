import classNames from 'classnames'
import Beef from 'components/beef'
import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import {VersionLinks} from 'components/link-container'
import Spinner from 'components/spinner'
import TcgLogo from 'components/tcg-logo'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {ConnectionError} from 'logic/session/session-reducer'
import {
	getConnecting,
	getConnectingMessage,
	getErrorType,
} from 'logic/session/session-selectors'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './login.module.scss'

const getLoginError = (errorType: ConnectionError) => {
	if (!errorType) return null
	if (errorType === 'session_expired') return 'Your session has expired.'
	if (errorType === 'timeout') return 'Connection attempt took too long.'
	if (errorType === 'invalid_name') return 'Your name is not valid.'
	if (errorType === 'invalid_version')
		return 'There has been a game update. Please refresh the website.'
	if (errorType === 'xhr poll_error') return "Can't reach the server."
	if (errorType === 'bad_auth')
		return 'Authentication failed. Please check your UUID and secret are correct.'
	if (errorType === 'invalid_session') return 'Reloading...'
	return (errorType as string).substring(0, 150)
}

const Login = () => {
	const dispatch = useMessageDispatch()
	let connecting = useSelector(getConnecting)
	let errorType = useSelector(getErrorType)
	const connectingMessage = useSelector(getConnectingMessage)

	const [syncing, setSyncing] = useState<boolean>(false)

	const handlePlayerName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const name = ev.currentTarget.playerName.value.trim()
		if (name.length > 0) {
			dispatch({
				type: localMessages.LOGIN,
				login_type: 'new-account',
				name: name,
			})
		}
	}

	const handleSync = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const uuid = ev.currentTarget.uuid.value.trim()
		const secret = ev.currentTarget.secret.value.trim()
		if (uuid.length > 0 && secret.length > 0)
			dispatch({
				type: localMessages.LOGIN,
				login_type: 'sync',
				uuid: uuid,
				secret: secret,
			})
	}

	if (errorType === 'invalid_session') {
		errorType = undefined
		connecting = true
	}

	if (errorType) {
		return (
			<div className={css.loginBackground}>
				<div className={css.loginContainer}>
					<div className={classNames(css.logo, syncing && css.hideOnMobile)}>
						<TcgLogo />
					</div>
					<div className={css.errorBanner}>
						{errorType && <ErrorBanner>{getLoginError(errorType)}</ErrorBanner>}
					</div>
					<Button
						className={css.loginButton}
						type="submit"
						onClick={() => {
							const secret = localStorage.getItem('databaseInfo:secret')
							const uuid = localStorage.getItem('databaseInfo:userId')

							if (!uuid || !secret) return

							dispatch({
								type: localMessages.LOGIN,
								login_type: 'sync',
								uuid,
								secret,
							})
						}}
					>
						Retry
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className={css.loginBackground}>
			<div className={css.loginContainer}>
				<div className={classNames(css.logo, syncing && css.hideOnMobile)}>
					<TcgLogo />
				</div>
				{connecting ? (
					<div className={css.connecting}>
						<Spinner />
						<p>{connectingMessage}</p>
					</div>
				) : (
					<div>
						<form
							className={classNames(
								css.nameForm,
								syncing && css.currentlySyncing,
							)}
							onSubmit={handlePlayerName}
						>
							<h1>Welcome to HC-TCG Online</h1>
							<p>Play the game that took the Hermitcraft community by storm.</p>
							<p>To get started, choose a name!</p>
							<div className={css.inputArea}>
								<div className={css.customInput}>
									<input
										maxLength={25}
										name="playerName"
										placeholder=" "
										autoFocus
										id="username"
									></input>
									<label htmlFor="username">Player Name</label>
								</div>
								<Button
									className={css.loginButton}
									variant={'primary'}
									type="submit"
								>
									Play
								</Button>
							</div>
						</form>
						<div
							className={classNames(
								css.syncContainer,
								syncing && css.currentlySyncing,
							)}
						>
							<p>Or, if you've already logged in on another device </p>
							<Button
								type="submit"
								className={css.loginButton}
								onClick={() => {
									setSyncing(true)
								}}
							>
								Sync Account
							</Button>
						</div>
						<div className={classNames(css.syncing, syncing && css.selected)}>
							<h1>Sync Account</h1>
							<div className={css.textBlurb}>
								<p>
									Enter your UUID and Secret to connect your Account. These can
									be found by{' '}
									<span className={css.highlight}>
										clicking on Settings, then the Data Management tab in-game.
									</span>{' '}
									Your account data will automatically sync between all
									connected devices.
								</p>
							</div>
							<form className={css.syncingForm} onSubmit={handleSync}>
								<div className={css.infoInput}>
									<input
										maxLength={100}
										name="UUID"
										placeholder="UUID"
										autoFocus
										id="uuid"
									></input>
								</div>
								<div className={css.infoInput}>
									<input
										maxLength={100}
										name="Secret"
										placeholder="Secret"
										autoFocus
										id="secret"
									></input>
								</div>
								<div className={css.syncButtons}>
									<Button
										className={classNames(css.loginButton, css.syncButton)}
										onClick={() => {
											setSyncing(false)
										}}
									>
										Go Back
									</Button>
									<Button
										type="submit"
										className={classNames(css.loginButton, css.syncButton)}
									>
										Sync
									</Button>
								</div>
							</form>
						</div>
					</div>
				)}
				<VersionLinks />
				<Beef />
			</div>
		</div>
	)
}

export default Login
