import CARDS from '../cards'

/**
 * @typedef {import("./root-model").GameModel} GameModel
 */

export class DerivedStateModel {
	/**
	 * @param {GameModel} game
	 */
	constructor(game) {
		/** @type {GameModel} */
		this.game = game
	}

	get currentPlayerId() {
		return this.game.state.order[(this.game.state.turn + 1) % 2]
	}

	get opponentPlayerId() {
		return this.game.state.order[this.game.state.turn % 2]
	}

	get currentPlayer() {
		return this.game.state.players[this.currentPlayerId]
	}

	get opponentPlayer() {
		return this.game.state.players[this.opponentPlayerId]
	}

	get playerActiveRow() {
		const player = this.currentPlayer
		return player.board.activeRow !== null
			? player.board.rows[player.board.activeRow]
			: null
	}

	get opponentActiveRow() {
		const player = this.opponentPlayer
		return player.board.activeRow !== null
			? player.board.rows[player.board.activeRow]
			: null
	}

	get playerHermitCard() {
		const activeRow = this.playerActiveRow
		return activeRow ? activeRow.hermitCard : null
	}

	get opponentHermitCard() {
		const activeRow = this.opponentActiveRow
		return activeRow ? activeRow.hermitCard : null
	}

	get playerHermitInfo() {
		const hermitCard = this.playerHermitCard
		return hermitCard ? CARDS[hermitCard.cardId] : null
	}

	get opponentHermitInfo() {
		const hermitCard = this.opponentHermitCard
		return hermitCard ? CARDS[hermitCard.cardId] : null
	}

	get playerEffectCard() {
		const activeRow = this.playerActiveRow
		return activeRow ? activeRow.effectCard : null
	}

	get opponentEffectCard() {
		const activeRow = this.opponentActiveRow
		return activeRow ? activeRow.effectCard : null
	}

	get playerEffectCardInfo() {
		const effectCard = this.playerEffectCard
		return effectCard ? CARDS[effectCard.cardId] : null
	}

	get opponentEffectCardInfo() {
		const effectCard = this.opponentEffectCard
		return effectCard ? CARDS[effectCard.cardId] : null
	}

	get singleUseCard() {
		return this.currentPlayer.board.singleUseCard
	}

	get singleUseInfo() {
		const singleUseCard = this.singleUseCard
		return singleUseCard ? CARDS[singleUseCard.cardId] : null
	}
}
