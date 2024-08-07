import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import Spinner from 'components/spinner'
import TcgLogo from 'components/tcg-logo'
import {actions, useActionDispatch} from 'logic/messages'
import {
	getCode,
	getInvalidCode,
	getStatus,
} from 'logic/matchmaking/matchmaking-selectors'
import React from 'react'
import {useSelector} from 'react-redux'
import css from './match-making.module.scss'

function MatchMaking() {
	const dispatch = useActionDispatch()
	const status = useSelector(getStatus)
	const code = useSelector(getCode)
	const invalidCode = useSelector(getInvalidCode)

	const handleCancel = () => {
		dispatch({type: actions.MATCHMAKING_LEAVE})
	}

	const handleCodeSubmit = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const code = ev.currentTarget.gameCode.value.trim()
		dispatch({type: actions.MATCHMAKING_CODE_SET, code})
	}

	const handleCodeClick = () => {
		if (!code) return
		navigator.clipboard.writeText(code)
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
			case 'private_waiting':
				return (
					<>
						<p>Waiting for opponent</p>
						<div className={css.code} onClick={handleCodeClick}>
							{code}
						</div>
						<div className={css.options}>
							<Button variant="stone" onClick={handleCancel}>
								Cancel
							</Button>
						</div>
					</>
				)
			case 'private_code_needed':
				return (
					<>
						<form className={css.codeInput} onSubmit={handleCodeSubmit}>
							<label htmlFor="gameCode">Enter game code:</label>
							<input
								className={invalidCode ? css.invalidCode : ''}
								name="gameCode"
								id="gameCode"
								autoFocus
							/>
							{invalidCode && <ErrorBanner>Invalid Code</ErrorBanner>}
							<div className={css.options}>
								<Button type="button" variant="stone" onClick={handleCancel}>
									Cancel
								</Button>
								<Button type="submit" variant="stone">
									Join
								</Button>
							</div>
						</form>
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
