# Lockstep

Hermitcraft TCG uses lockstep progression for networking. Becuase this game has secret values for each player this makes it a little complicated.

## Hidden Values

The following items are visible on the server but hidden for one or more players.

- Hand: only visible to the player who the hand belongs to
- Deck: only visible to the player who the deck belongs to

Cards are added to the ECS for the clients when they are revealed to both players. The same entity will be used for all
components for the same card.

