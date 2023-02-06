import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setCode, leaveMatchmaking} from 'logic/matchmaking/matchmaking-actions'
import {
	getStatus,
	getCode,
	getInvalidCode,
} from 'logic/matchmaking/matchmaking-selectors'
import css from './match-making.module.css'

function MatchMaking() {
	const dispatch = useDispatch()
	const status = useSelector(getStatus)
	const code = useSelector(getCode)
	const invalidCode = useSelector(getInvalidCode)

	const handleCancel = (ev: React.SyntheticEvent<HTMLButtonElement>) => {
		ev.preventDefault()
		dispatch(leaveMatchmaking())
	}

	const handleCodeSubmit = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const code = ev.currentTarget.gameCode.value.trim()
		dispatch(setCode(code))
	}

	const handleCodeClick = () => {
		if (!code) return
		navigator.clipboard.writeText(code)
	}

	let content = null
	if (status === 'random_waiting') {
		content = (
			<>
				<div className={css.message}>Waiting for opponent</div>
				<button onClick={handleCancel}>Cancel</button>
			</>
		)
	} else if (status === 'loading') {
		content = (
			<>
				<div className={css.message}>Loading...</div>
			</>
		)
	} else if (status === 'starting') {
		content = (
			<>
				<div className={css.message}>Starting game...</div>
			</>
		)
	} else if (status === 'private_waiting') {
		content = (
			<>
				<div className={css.message}>Waiting for opponent</div>
				<div className={css.code} onClick={handleCodeClick}>
					{code}
				</div>
				<div className={css.options}>
					<button onClick={handleCancel}>Cancel</button>
				</div>
			</>
		)
	} else if (status === 'private_code_needed') {
		content = (
			<>
				<div className={css.message}>Please enter game code</div>
				<form className={css.codeInput} onSubmit={handleCodeSubmit}>
					<input
						className={invalidCode ? css.invalidCode : undefined}
						name="gameCode"
						autoFocus
					/>
					<div className={css.options}>
						<button onClick={handleCancel}>Cancel</button>
						<button>Join</button>
					</div>
				</form>
			</>
		)
	}

	return (
		<div className={css.matchmaking}>
			<img width="200" height="184" src="/images/tcg1.png" />
			{content}
		</div>
	)
}

export default MatchMaking
