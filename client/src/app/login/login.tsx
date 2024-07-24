import {useSelector, useDispatch} from 'react-redux'
import {getConnecting, getErrorType} from 'logic/session/session-selectors'
import {login} from 'logic/session/session-actions'
import css from './login.module.scss'
import TcgLogo from 'components/tcg-logo'
import {VersionLinks} from 'components/link-container'
import Button from 'components/button'
import Spinner from 'components/spinner'
import ErrorBanner from 'components/error-banner'
import Beef from 'components/beef'

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
	const dispatch = useDispatch()
	const connecting = useSelector(getConnecting)
	const errorType = useSelector(getErrorType)

	const handlePlayerName = (ev: SubmitEvent) => {
		ev.preventDefault()
		const name = (ev.currentTarget as HTMLFormElement).playerName.value.trim()
		if (name.length > 0) dispatch(login(name))
	}

	return (
		<div className={css.loginBackground}>
			<div className={css.loginContainer}>
				<TcgLogo />
				{connecting ? (
					<div className={css.connecting}>
						<Spinner />
						<p>Connecting</p>
					</div>
				) : (
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
				)}
				{errorType && <ErrorBanner>{getLoginError(errorType)}</ErrorBanner>}
				<VersionLinks />
				<Beef />
			</div>
		</div>
	)
}

export default Login
