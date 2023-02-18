import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {getConnecting} from 'logic/session/session-selectors'
import {login} from 'logic/session/session-actions'
import css from './login.module.css'

function Login() {
	const dispatch = useDispatch()
	const connecting = useSelector(getConnecting)

	const handlePlayerName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const name = ev.currentTarget.playerName.value.trim()
		if (name.length > 0) dispatch(login(name))
	}

	return (
		<div className={css.login}>
			<img width="200" height="184" src="/images/tcg1.png" />

			{connecting ? (
				<div className={css.connecting}>Connecting...</div>
			) : (
				<>
					<form onSubmit={handlePlayerName}>
						<input
							maxLength={25}
							name="playerName"
							placeholder="Player name..."
							autoFocus
						/>
						<button>Next</button>
					</form>
					<div className={css.info}>
						<a
							href="https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/"
							target="_blank"
							rel="noreferrer"
						>
							<img src="/images/icons/reddit.svg" height="26" />
							Reddit
						</a>
						<a
							href="https://github.com/martinkadlec0/hc-tcg"
							target="_blank"
							rel="noreferrer"
						>
							<img src="/images/icons/github.svg" height="26" />
							Github
						</a>
						<a
							href="https://discord.gg/AjGbqNfcQX"
							target="_blank"
							rel="noreferrer"
						>
							<img src="/images/icons/discord.svg" height="26" />
							Fan Discord
						</a>
					</div>
				</>
			)}
		</div>
	)
}

export default Login
