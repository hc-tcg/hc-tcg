import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {getConnecting, getErrorType} from 'logic/session/session-selectors'
import {login} from 'logic/session/session-actions'
import css from './login.module.scss'
import TcgLogo from 'components/tcg-logo'
import LinkContainer from 'components/link-container'
import Button from 'components/button'

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

function Login() {
	const dispatch = useDispatch()
	const connecting = useSelector(getConnecting)
	const errorType = useSelector(getErrorType)

	const handlePlayerName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const name = ev.currentTarget.playerName.value.trim()
		if (name.length > 0) dispatch(login(name))
	}

	return (
		/* Background Image */
		<div className={`${css.loginBackground} temp`}>
			<div className={css.loginContainer}>
				<TcgLogo />
				{connecting ? (
					<div className={css.connecting}>Connecting...</div>
				) : (
					<form className={css.nameForm} onSubmit={handlePlayerName}>
						<div className={css.customInput}>
							<input
								maxLength={25}
								name="playerName"
								placeholder=" "
								autoFocus
							></input>
							<span className={css.placeholder}>Player Name</span>
						</div>
						<Button variant="stone" type="submit">
							Next
						</Button>
					</form>
				)}
				{errorType ? (
					<div className={css.error}>{getLoginError(errorType)}</div>
				) : null}
				<LinkContainer />
			</div>
		</div>
	)
}

export default Login
