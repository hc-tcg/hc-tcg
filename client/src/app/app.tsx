import React, {useState} from 'react'
import Game from './game'
import css from './app.module.css'
import {useSelector, useDispatch} from 'react-redux'
import {RootState} from 'store'

function App() {
	const dispatch = useDispatch()
	const playerName = useSelector((state: RootState) => state.playerName)
	const gameType = useSelector((state: RootState) => state.gameType)

	const handlePlayerName = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const name = ev.currentTarget.playerName.value.trim()
		if (name.length > 0) dispatch({type: 'SET_NAME', playerName: name})
	}

	const handleStranger = () =>
		dispatch({type: 'SET_GAME_TYPE', gameType: 'stranger'})
	const handleFriend = () =>
		dispatch({type: 'SET_GAME_TYPE', gameType: 'friend'})

	return (
		<main>
			<div className={css.form}>
				{!playerName ? (
					<>
						<header>HermitCraft TCG</header>
						<form onSubmit={handlePlayerName}>
							<input name="playerName" placeholder="Player name..." autoFocus />
							<button>Next</button>
						</form>
					</>
				) : null}
				{playerName && !gameType ? (
					<>
						<header>HermitCraft TCG</header>
						<button onClick={handleStranger}>Play with a stranger</button>
						<button onClick={handleFriend}>Play with a friend</button>
					</>
				) : null}
				{playerName && gameType ? (
					<Game name={playerName} gameType={gameType} />
				) : null}
			</div>
		</main>
	)
}

export default App
