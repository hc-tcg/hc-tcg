import Beef from 'components/beef'
import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import {VersionLinks} from 'components/link-container'
import Spinner from 'components/spinner'
import TcgLogo from 'components/tcg-logo'
import Toast, {ToastContainer} from 'components/toast/toast'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	getConnecting,
	getConnectingMessage,
	getErrorType,
	getToast,
} from 'logic/session/session-selectors'
import React from 'react'
import {useSelector} from 'react-redux'
import css from './login.module.scss'

const getLoginError = (errorType: string) => {
	if (!errorType) return null
	if (errorType === 'session_expired') return 'Your session has expired.'
	if (errorType === 'timeout') return 'Connection attempt took too long.'
	if (errorType === 'invalid_name') return 'Your name is not valid.'
	if (errorType === 'invalid_version')
		return 'There has been a game update. Please refresh the website.'
	if (errorType === 'xhr poll error') return "Can't reach the server."
	return errorType.substring(0, 150)
}

const Login = () => {
	const dispatch = useMessageDispatch()
	const connecting = useSelector(getConnecting)
	const errorType = useSelector(getErrorType)
	const connectingMessage = useSelector(getConnectingMessage)
	const toastMessage = useSelector(getToast)

	const handlePlayerName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const name = ev.currentTarget.playerName.value.trim()
		if (name.length > 0)
			dispatch({
				type: localMessages.LOGIN,
				login_type: 'new-account',
				name: name,
			})
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

	return (
		<>
			<ToastContainer>
				{toastMessage.map((toast, i) => {
					return (
						<Toast
							title={toast.toast.title}
							description={toast.toast.description}
							image={toast.toast.image}
							id={toast.id}
							key={i}
						/>
					)
				})}
			</ToastContainer>
			<div className={css.loginBackground}>
				<div className={css.loginContainer}>
					<TcgLogo />
					{connecting ? (
						<div className={css.connecting}>
							<Spinner />
							<p>{connectingMessage}</p>
						</div>
					) : (
						<div>
							<form className={css.nameForm} onSubmit={handlePlayerName}>
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
								<Button variant="stone" type="submit">
									Next
								</Button>
							</form>
							<p> Sync to an existing account </p>
							<form className={css.nameForm} onSubmit={handleSync}>
								<div className={css.customInput}>
									<input
										maxLength={25}
										name="UUID"
										placeholder=" "
										autoFocus
										id="uuid"
									></input>
									<label htmlFor="uuid">Account UUID</label>
								</div>
								<div className={css.customInput}>
									<input
										maxLength={25}
										name="Secret"
										placeholder=" "
										autoFocus
										id="secret"
									></input>
									<label htmlFor="secret">Account Secret</label>
								</div>
								<Button variant="stone" type="submit">
									Next
								</Button>
							</form>
						</div>
					)}
					{errorType && <ErrorBanner>{getLoginError(errorType)}</ErrorBanner>}
					<VersionLinks />
					<Beef />
				</div>
			</div>
		</>
	)
}

export default Login
