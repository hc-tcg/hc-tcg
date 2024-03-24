import {CARDS, HERMIT_CARDS} from '../cards'
import {AttackActionData, PlayCardActionData} from '../types/action-data'
import {
	MessageTextT,
	BattleLogT,
	CurrentCoinFlipT,
	PlayerState,
	RowStateWithHermit,
	CardT,
} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {getCardPos} from './card-pos-model'
import {GameModel} from './game-model'

export type BattleLogFormatT = Parameters<BattleLog['format']>

export class BattleLog {
	private game: GameModel
	private log: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game
		this.log = []
	}

	// BATTLE LOG STUFF //
	private format(
		text: string,
		format: 'plain' | 'highlight' | 'player' | 'opponent',
		condition: 'player' | 'opponent' | undefined = undefined
	): MessageTextT {
		const output: MessageTextT = {
			text: text,
			censoredText: text,
			format: format,
		}
		if (condition) output.condition = condition
		return output
	}

	private sendBattleLogEntry() {
		this.game.getPlayers().forEach((player) => {
			player.socket.emit('BATTLE_LOG_ENTRY', {
				type: 'BATTLE_LOG_ENTRY',
				payload: this.log,
			})
		})

		while (this.log.length > 0) {
			const lastEntry = this.log.pop()
			if (!lastEntry) continue

			this.game.chat.push({
				createdAt: Date.now(),
				message: lastEntry.description,
				playerId: lastEntry.player,
				systemMessage: true,
			})
		}

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addPlayCardEntry(turnAction: PlayCardActionData) {
		const currentPlayer = this.game.currentPlayer.playerName

		const card = turnAction.payload.card
		const cardInfo = CARDS[card.cardId]

		const slot = turnAction.payload.pickInfo.slot

		if (slot.type === 'hermit') {
			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: [
					this.format(`You `, 'plain', 'player'),
					this.format(`${currentPlayer} `, 'plain', 'opponent'),
					this.format(`placed `, 'plain'),
					this.format(`${cardInfo.name} `, 'player'),
				],
			}
			this.log.push(entry)
		} else if (slot.type === 'item' || slot.type === 'effect') {
			const cardPosition = getCardPos(this.game, turnAction.payload.card.cardInstance)
			const attachedHermit = cardPosition?.row?.hermitCard
			if (!attachedHermit) return

			const attachedHermitName = CARDS[attachedHermit.cardId].name

			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: [
					this.format(`You `, 'plain', 'player'),
					this.format(`${currentPlayer} `, 'plain', 'opponent'),
					this.format(`attached `, 'plain'),
					this.format(
						`${cardInfo.name}${cardInfo.type === 'item' ? ' item' : ''}${
							cardInfo.type === 'item' && cardInfo.rarity === 'rare' ? ' x2' : ''
						} `,
						'highlight'
					),
					this.format(`to `, 'plain'),
					this.format(`${attachedHermitName} `, 'player'),
				],
			}
			this.log.push(entry)
		} else if (slot.type === 'single_use') {
			return
		}

		this.sendBattleLogEntry()
	}

	public addApplyEffectEntry(effectAction: BattleLogFormatT[]) {
		const currentPlayer = this.game.currentPlayer.playerName

		const card = this.game.currentPlayer.board.singleUseCard
		if (!card) return

		const cardInfo = CARDS[card.cardId]

		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: [
				this.format(`You `, 'plain', 'player'),
				this.format(`${currentPlayer} `, 'plain', 'opponent'),
				this.format(`used `, 'plain'),
				this.format(`${cardInfo.name} `, 'highlight'),
				...effectAction.map(([text, format, condition]) => this.format(text, format, condition)),
			],
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addChangeHermitEntry(oldHermit: CardT | null, newHermit: CardT | null) {
		if (!oldHermit || !newHermit) return
		const player = getCardPos(this.game, oldHermit.cardInstance)?.player
		if (!player) return

		const currentPlayer = this.game.currentPlayer === player

		const oldHermitInfo = CARDS[oldHermit.cardId]
		const newHermitInfo = CARDS[newHermit.cardId]

		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: [
				this.format(`You `, 'plain', currentPlayer ? 'player' : 'opponent'),
				this.format(`${player.playerName} `, 'plain', currentPlayer ? 'opponent' : 'player'),
				this.format(`swapped `, 'plain'),
				this.format(`${oldHermitInfo.name} `, 'player'),
				this.format(`for `, 'plain'),
				this.format(`${newHermitInfo.name} `, 'player'),
			],
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addAttackEntry(turnAction: AttackActionData) {
		const currentPlayer = this.game.currentPlayer.playerName
		const type = turnAction.type
		if (type === 'SINGLE_USE_ATTACK') return

		const activeRow = this.game.activeRow
		if (activeRow === null) return
		const activeHermitId = activeRow.hermitCard?.cardId
		if (activeHermitId === undefined) return
		const activeHermit = HERMIT_CARDS[activeHermitId]

		const opponentActiveRow = this.game.opponentActiveRow
		if (opponentActiveRow === null) return
		const opponentActiveHermitId = opponentActiveRow.hermitCard?.cardId
		if (opponentActiveHermitId === undefined) return
		const opponentActiveHermit = CARDS[opponentActiveHermitId]

		const attackName =
			type === 'PRIMARY_ATTACK' ? activeHermit.primary.name : activeHermit.secondary.name

		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: [
				this.format(`Your `, 'plain', 'player'),
				this.format(`${currentPlayer}'s `, 'plain', 'opponent'),
				this.format(`${activeHermit.name} `, 'player'),
				this.format(`attacked `, 'plain'),
				this.format(`${opponentActiveHermit.name} `, 'opponent'),
				this.format(`with `, 'plain'),
				this.format(`${attackName} `, 'highlight'),
			],
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public async addCoinFlipEntry(coinFlips: Array<CurrentCoinFlipT>) {
		const otherPlayer = this.game.currentPlayer.playerName

		if (coinFlips.length === 0) return
		for (const coinFlip of coinFlips) {
			const cardName = CARDS[coinFlip.cardId].name

			const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
			const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

			let description_body = ''

			if (coinFlip.tosses.length === 1) {
				description_body = heads > tails ? `flipped heads on ` : `flipped tails on `
			} else if (tails === 0) {
				description_body = `flipped all ${heads} heads on `
			} else if (heads === 0) {
				description_body = `flipped all ${tails} tails on `
			} else {
				description_body = `flipped ${heads} heads and ${tails} tails on `
			}

			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: [],
			}

			if (HERMIT_CARDS[coinFlip.cardId]) {
				entry.description = [
					this.format(`Your `, 'plain', 'player'),
					this.format(`${otherPlayer}'s `, 'plain', 'opponent'),
					this.format(`${cardName} `, coinFlip.opponentFlip ? 'opponent' : 'player'),
					this.format(description_body + 'their attack', 'plain'),
				]
			} else {
				entry.description = [
					this.format(`You `, 'plain', 'player'),
					this.format(`${otherPlayer} `, 'plain', 'opponent'),
					this.format(description_body, 'plain'),
					this.format(`${cardName} `, 'highlight'),
				]
			}

			this.log.push(entry)
		}

		await new Promise((r) => setTimeout(r, 2000))

		this.sendBattleLogEntry()
	}

	public addOutOfPhaseAttackEntry(attack: AttackModel, type: string) {
		const targetHermitId = attack.target?.row.hermitCard.cardId
		const targetPlayer = attack.target?.player
		if (!targetHermitId || !targetPlayer) return
		const targetHermitInfo = CARDS[targetHermitId]

		const isTarget = targetPlayer === this.game.currentPlayer

		const entry: BattleLogT = {
			player: this.game.opponentPlayer.id,
			description: [
				this.format(`${targetPlayer.playerName}'s `, 'plain', isTarget ? 'player' : 'opponent'),
				this.format(`Your `, 'plain', isTarget ? 'opponent' : 'player'),
				this.format(`${targetHermitInfo.name} `, 'player'),
				this.format(`took ${attack.calculateDamage()} damage from `, 'plain'),
				this.format(`${type}`, 'highlight'),
			],
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addDeathEntry(playerState: PlayerState, row: RowStateWithHermit) {
		const card = row.hermitCard
		const cardName = CARDS[card.cardId].name

		const entry: BattleLogT = {
			player: playerState.id,
			description: [
				this.format(`Your `, 'plain', 'player'),
				this.format(`${playerState.playerName}'s `, 'plain', 'opponent'),
				this.format(`${cardName} `, 'player'),
				this.format(`was knocked out, and `, 'plain'),
				this.format(`you `, 'plain', 'player'),
				this.format(`${playerState.playerName} `, 'plain', 'opponent'),
				this.format(`now have `, 'plain', 'player'),
				this.format(`now has `, 'plain', 'opponent'),
				this.format(`one life remaining`, 'plain'),
			],
		}

		if (playerState.lives === 3) {
			entry.description[8] = this.format(`two lives remaining`, 'plain')
		}

		this.log.push(entry)

		// wait for coinflips to call sendBattleLogEntry if there are any
		if (this.game.currentPlayer.coinFlips.length === 0) {
			this.sendBattleLogEntry()
		}
	}

	public addTimeoutEntry() {
		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: [
				this.format(`You `, 'plain', 'player'),
				this.format(`${this.game.currentPlayer} `, 'plain', 'opponent'),
				this.format(`ran out of time `, 'plain'),
			],
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}
}
