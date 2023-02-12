# Pre-alpha 1
- Go through all cards, make sure at least their main funcionality is working
- Indicate when you have a card selected - in more visible way
- Milk bucket on hermit doesnt remove effect (also on steal)
- Bdubs/Bed should restore health immediately
- Somehow my chorus fruit, while attacking with mumbo got used up


# Pre-alpha 2
- Gem should also allow extra normal effect card
- shield of active hermit gets destroyed on hypnos afk attack
- On some turns I can't do anything except ending my turn :(
	- include pastTurnActions in game_state for debugging

- crossbow without active hermits

- Changed deck localStorage
- Move REQS for validation on BE and use them there
- Implement missing cards
- Clear availableActions after an action until new game state arrives (some indicator?)
- Limit slot clicks (onClick, cursor pointer, hover state) based on availableActions, selectedCard & pickProcess
- on log out, remove user, not just disconnect
- Deal with one player having TWO sockets connected.