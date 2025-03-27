import {GameModel} from '../models/game-model'

type LogSeverity = 'info' | 'warning' | 'error'

export function dedent() {}

/** Log using the quickwit format <https://quickwit.io/> */
export function quickwitLog(severity: LogSeverity, type: string, log: any) {
	console.log(
		JSON.stringify({
			type: type,
			severity,
			log: log,
		}),
	)
}

/** Log using the quickwit format for game logs */
export function quickwitLogGame(
	severity: LogSeverity,
	game: GameModel,
	log: any,
) {
	console.log(
		JSON.stringify({
			type: 'game',
			gameId: game.id,
			severity: severity,
			log: log,
		}),
	)
}
