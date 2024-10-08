export type MatchmakingStatus =
	| 'loading'
	| 'random_waiting'
	| 'private_lobby'
	| 'waiting_for_player'
	| 'waiting_for_player_as_spectator'
	| 'in_game'
	| null
