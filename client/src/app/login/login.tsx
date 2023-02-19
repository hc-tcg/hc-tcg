import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {getConnecting, getUUID, getStats} from 'logic/session/session-selectors'
import {login} from 'logic/session/session-actions'
import css from './login.module.css'

function Login() {
	const dispatch = useDispatch()
	const connecting = useSelector(getConnecting)
	const uuid = useSelector(getUUID)
	const stats = useSelector(getStats)

  const oauthGoogle = ()=>{
		var google_provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithRedirect(google_provider);
	}
	const oauthAnon = ()=>{
		firebase.auth().signInAnonymously();
	}

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
						>
							<img src="/images/icons/reddit.svg" height="26" />
							Reddit
						</a>
						<a href="https://github.com/martinkadlec0/hc-tcg" target="_blank">
							<img src="/images/icons/github.svg" height="26" />
							Github
						</a>
						<a href="https://discord.gg/AjGbqNfcQX" target="_blank">
							<img src="/images/icons/discord.svg" height="26" />
							Fan Discord
						</a>
					</div>
					{!uuid ? (<>
						<div className={css.info}>
							<span>
							  <a onClick={oauthGoogle}>
									<img src="/images/icons/btn_google_dark_normal_ios.svg" height="26" />
									Login with Google
								</a>
							</span>
							<span>
							  <a onClick={oauthAnon}>
									<img src="/images/icons/anon.png" height="26" />
									Login Anonymously
								</a>
							</span>
						</div>
						<div className={css.info}>
						  Logging in will let you save decks and track your own stats (Google auth works between browsers)
						</div>
						</>) : (
						<div className={css.info}>
						  <span>
  						  Logged In, W-L: {stats.w}-{stats.l}
							</span>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default Login
