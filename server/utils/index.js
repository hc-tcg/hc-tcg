export function equalCard(card1, card2) {
	if (card1 === null || card2 === null) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}
