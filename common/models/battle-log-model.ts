import {CARDS, HERMIT_CARDS} from '../cards'
import {AttackActionData, PlayCardActionData} from '../types/action-data'
import {
	BattleLogT,
	CurrentCoinFlipT,
	PlayerState,
	RowStateWithHermit,
	CardT,
	IncompleteLogT,
} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {getCardPos} from './card-pos-model'
import {GameModel} from './game-model'
import {TextNode, formatText} from '../utils/formatting'
import {DEBUG_CONFIG} from '../config'

export class BattleLogModel {
	private game: GameModel
	private logMessageQueue: Array<IncompleteLogT>
	private log: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game

		/** Log entries that still need to be processed */
		this.logMessageQueue = []

		//** Completed log entries */
		this.log = []
	}

	private sendBattleLogEntry() {
		this.game.getPlayers().forEach((player) => {
			player.socket?.emit('BATTLE_LOG_ENTRY', {
				type: 'BATTLE_LOG_ENTRY',
				payload: this.log,
			})
		})

		while (this.log.length > 0) {
			const lastEntry = this.log.pop()
			if (!lastEntry) continue

			// @todo This seems to be broken
			this.game.chat.push({
				createdAt: Date.now(),
				message: lastEntry.description ? lastEntry.description : new TextNode(''),
				sender: lastEntry.player,
				systemMessage: true,
			})
		}

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	private generateEffectEntryHeader(): string {
		const currentPlayer = this.game.currentPlayer.playerName
		const card = this.game.currentPlayer.board.singleUseCard
		if (!card) return ''
		const cardInfo = CARDS[card.cardId]

		return `$p{You|${currentPlayer}}$ used $e${cardInfo.name}$ `
	}

	public sendLogs() {
		this.logMessageQueue.forEach((entry) => {
			this.log.push({
				player: entry.player,
				description: formatText(entry.description),
			})
		})
		this.logMessageQueue = []

		this.sendBattleLogEntry()
	}

	public addPlayCardEntry(turnAction: PlayCardActionData) {
		const currentPlayer = this.game.currentPlayer.playerName

		const card = turnAction.payload.card
		const cardInfo = CARDS[card.cardId]

		const slot = turnAction.payload.pickInfo.slot

		if (slot.type === 'hermit') {
			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: formatText(`$p{You|${currentPlayer}}$ placed $p${cardInfo.name}$`),
			}
			this.log.push(entry)
		} else if (slot.type === 'item' || slot.type === 'effect') {
			const cardPosition = getCardPos(this.game, turnAction.payload.card.cardInstance)
			const attachedHermit = cardPosition?.row?.hermitCard
			if (!attachedHermit) return

			const attachedHermitName = CARDS[attachedHermit.cardId].name

			if (cardInfo.type === 'item') {
				const rare = cardInfo.rarity === 'rare' ? ' x2' : ''
				const entry: BattleLogT = {
					player: this.game.currentPlayer.id,
					description: formatText(
						`$p{You|${currentPlayer}}$ attached $m${cardInfo.name} item${rare}$ to $p${attachedHermitName}$`
					),
				}
				this.log.push(entry)
			} else if (cardInfo.type === 'effect') {
				const entry: BattleLogT = {
					player: this.game.currentPlayer.id,
					description: formatText(
						`$p{You|${currentPlayer}}$ attached $e${cardInfo.name}$ to $p${attachedHermitName}$`
					),
				}
				this.log.push(entry)
			}
		} else if (slot.type === 'single_use') {
			return
		}

		this.sendBattleLogEntry()
	}

	public addApplySingleUseEntry(effectAction?: string) {
		const entry: IncompleteLogT = {
			player: this.game.currentPlayer.id,
			description: `${this.generateEffectEntryHeader()} ${effectAction ? effectAction : ''}`,
		}
		this.logMessageQueue.push(entry)

		this.sendLogs()
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
			description: formatText(
				`$p{You|${currentPlayer}}$ swapped $p${oldHermitInfo.name}$ for $p${newHermitInfo.name}$`
			),
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addAttackEntry(attack: AttackModel) {
		const playerId = attack.getAttacker()?.player.id

		if (!playerId) return

		const attacks = [attack, ...attack.nextAttacks]

		const queuedLog = attacks.reduce((reducer, attack) => {
			const attacker = attack.getAttacker()
			const target = attack.getTarget()

			if (!attacker || !target) return reducer

			if (attack.getDamage() === 0) return reducer

			const attackingHermitInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			const targetHermitInfo = CARDS[target.row.hermitCard.cardId]

			const targetFormatting = target.player.id === playerId ? 'p' : 'o'

			const attackName =
				attack.type === 'primary'
					? attackingHermitInfo.primary.name
					: attackingHermitInfo.secondary.name

			const logMessage = attack.log({
				attacker: `$p${attackingHermitInfo.name} (${target.rowIndex + 1})$`,
				opponent: target.player.playerName,
				target: `${targetHermitInfo.name} $${targetFormatting}(${target.rowIndex + 1}$)`,
				attackName: attackName,
				damage: attack.calculateDamage(),
				header: this.generateEffectEntryHeader(),
			})

			reducer += logMessage

			return reducer
		}, '' as string)

		if (queuedLog.length === 0) return

		const debugLog = DEBUG_CONFIG.logAttackHistory
			? attack.getHistory().reduce((reduce, hist) => {
					return reduce + `\n\t${hist.sourceId} → ${hist.type} ${hist.value}`
			  }, '')
			: ''

		this.logMessageQueue.push({
			player: playerId,
			description: queuedLog + debugLog,
		})
	}

	public addCustomEntry(entry: string, player: string) {
		const formattedEntry: BattleLogT = {
			player: player,
			description: formatText(entry),
		}

		this.log.push(formattedEntry)
		this.sendBattleLogEntry()
	}

	public async addCoinFlipEntry(coinFlips: Array<CurrentCoinFlipT>) {
		if (coinFlips.length === 0) return
		for (const coinFlip of coinFlips) {
			const cardName = CARDS[coinFlip.cardId].name

			const otherPlayer = coinFlip.opponentFlip
				? this.game.opponentPlayer.playerName
				: this.game.currentPlayer.playerName

			const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
			const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

			let description_body = ''

			if (coinFlip.tosses.length === 1) {
				description_body = heads > tails ? `flipped $gheads$ on ` : `flipped $btails$ on `
			} else if (tails === 0) {
				description_body = `flipped all ${heads} $gheads$ on `
			} else if (heads === 0) {
				description_body = `flipped all ${tails} $btails$ on `
			} else {
				description_body = `flipped ${heads} $gheads$ and ${tails} $btails$ on `
			}

			const entry: BattleLogT = {
				player: this.game.currentPlayer.id,
				description: undefined,
			}

			if (HERMIT_CARDS[coinFlip.cardId]) {
				entry.description = formatText(
					`$p{Your|${otherPlayer}'s}$ $p${cardName}$ ${description_body} their attack`
				)
			} else {
				entry.description = formatText(`$p{You|${otherPlayer}}$ ${description_body} $p${cardName}$`)
			}

			// this.log.push(entry)
		}

		// await new Promise((r) => setTimeout(r, 2000))

		// this.sendBattleLogEntry()
	}

	public addDeathEntry(playerState: PlayerState, row: RowStateWithHermit) {
		const card = row.hermitCard
		const cardName = CARDS[card.cardId].name

		const livesRemaining = 3 ? 'two lives' : 'one life'

		const entry: BattleLogT = {
			player: playerState.id,
			description: formatText(
				`$p{Your|${playerState.playerName}'s}$ $p${cardName}$ was knocked out, and {you|${playerState.playerName}} now {have|has} $b${livesRemaining}$ remaining`
			),
		}

		this.log.push(entry)
	}

	public addTimeoutEntry() {
		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: formatText(`{You|${this.game.currentPlayer}} ran out of time`),
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}

	public addTurnEndEntry() {
		const entry: BattleLogT = {
			player: this.game.currentPlayer.id,
			description: undefined,
		}
		this.log.push(entry)

		this.sendBattleLogEntry()
	}
}
