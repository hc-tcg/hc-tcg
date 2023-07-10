export class CardPos {
	player
	opponentPlayer
	instance
	/** @type {Number | null} */
	#rowIndex
	/** @type {import("types/cards").Slot} */
	#slot

	/**
	 * @param {PlayerState} player
	 * @param {PlayerState} opponentPlayer
	 * @param {string | null} instance
	 * @param {Number | null} rowIndex
	 * @param {import("types/cards").Slot} slot
	 */
	constructor(player, opponentPlayer, instance, rowIndex, slot) {
		this.player = player
		this.opponentPlayer = opponentPlayer
		this.instance = instance
		this.#rowIndex = rowIndex
		this.#slot = slot
	}

	/**
	 * Checks if the instance is in the same position as before
	 * @returns {Boolean}
	 */
	#checkInstancePos = () => {
		// The card hasn't been attached yet
		if (!this.instance) return true

		const {board} = this.player
		let card = null

		if (this.#slot.type === 'single_use') {
			card = board.singleUseCard
		} else if (this.#rowIndex !== null) {
			const row = board.rows[this.#rowIndex]
			if (this.#slot.type === 'hermit') {
				card = row.hermitCard
			} else if (this.#slot.type === 'effect') {
				card = row.effectCard
			} else if (this.#slot.type === 'item') {
				card = row.itemCards[this.#slot.index]
			}
		}

		return card?.cardInstance === this.instance
	}

	/**
	 * Searches for the instance on the board
	 * We only search the current side of the board, if the card is on the opponent's side
	 * then it should be reattached otherwise the hooks will be backwards
	 * @returns {Boolean}
	 */
	#searchInstance = () => {
		const board = this.player.board

		if (board.singleUseCard?.cardInstance === this.instance) {
			this.#rowIndex = null
			this.#slot.type = 'single_use'
			this.#slot.index = 0
			return true
		}

		// Go through rows to find instance
		for (let rowIndex = 0; rowIndex < board.rows.length; rowIndex++) {
			const row = board.rows[rowIndex]

			if (row.hermitCard?.cardInstance === this.instance) {
				this.#rowIndex = rowIndex
				this.#slot.type = 'hermit'
				this.#slot.index = 0
				return true
			}

			if (row.effectCard?.cardInstance === this.instance) {
				this.#rowIndex = rowIndex
				this.#slot.type = 'effect'
				this.#slot.index = 0
				return true
			}

			for (let i = 0; i < row.itemCards.length; i++) {
				const card = row.itemCards[i]
				if (card?.cardInstance === this.instance) {
					this.#rowIndex = rowIndex
					this.#slot.type = 'item'
					this.#slot.index = i
					return true
				}
			}
		}

		return false
	}

	/**
	 * Gets the RowIndex
	 * @returns {Number | null}
	 */
	get rowIndex() {
		if (this.#slot && this.#slot.type === 'single_use') return null
		if (!this.#checkInstancePos() && !this.#searchInstance()) {
			return null
		}
		return this.#rowIndex
	}

	/**
	 * Gets the RowState
	 * @returns {RowState | null}
	 */
	get row() {
		if (this.#slot.type === 'single_use') return null
		if (!this.#rowIndex) return null
		if (!this.#checkInstancePos() && !this.#searchInstance()) {
			return null
		}
		return this.player.board.rows[this.#rowIndex]
	}

	/**
	 * Gets the Slot
	 * @returns {import("types/cards").Slot | null}
	 */
	get slot() {
		if (!this.#checkInstancePos() && !this.#searchInstance()) {
			return null
		}
		return this.#slot
	}

	/**
	 * Gets the CardT from the current state.
	 * @returns {CardT | null}
	 */
	get card() {
		if (!this.#rowIndex) return null
		// if the instance is not in the same position as the current one, search for it
		if (!this.#checkInstancePos() && !this.#searchInstance()) {
			return null
		}

		const row = this.player.board.rows[this.#rowIndex]
		if (this.#slot.type === 'single_use') {
			return this.player.board.singleUseCard
		} else if (this.#slot.type === 'hermit') {
			return row.hermitCard
		} else if (this.#slot.type === 'effect') {
			return row.effectCard
		} else if (this.#slot.type === 'item') {
			return row.itemCards[this.#slot.index]
		}

		return null
	}
}

export default CardPos
