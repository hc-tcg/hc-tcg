import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setCode, leaveMatchmaking} from 'logic/matchmaking/matchmaking-actions'
import {
	getStatus,
	getCode,
	getInvalidCode,
} from 'logic/matchmaking/matchmaking-selectors'
import css from './match-making.module.css'
import TcgLogo from 'components/tcg-logo'

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
				<button className={css.matchmakingButton} onClick={handleCancel}>
					Cancel
				</button>
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
					<button className={css.matchmakingButton} onClick={handleCancel}>
						Cancel
					</button>
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
					<p className={invalidCode ? css.invalidText : css.hiddenInvalidText}>
						Invalid code
					</p>
					<div className={css.options}>
						<button className={css.matchmakingButton} onClick={handleCancel}>
							Cancel
						</button>
						<button className={css.matchmakingButton}>Join</button>
					</div>
				</form>
			</>
		)
	}

	return (
		<div className={`${css.matchMakingBackground} temp`}>
			<div className={css.matchMakingContainer}>
				<TcgLogo />
				{content}
			</div>
		</div>
	)
}

export default MatchMaking
