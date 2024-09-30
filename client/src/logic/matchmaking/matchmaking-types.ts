export type MatchmakingStatus =
	| 'loading'
	| 'random_waiting'
	| 'private_waiting'
	| 'waiting_for_player'
	| 'waiting_for_player_as_spectator'
	| 'private_code_needed'
	| 'starting'
	| null
