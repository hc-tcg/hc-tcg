import {CARDS, HERMIT_CARDS, SINGLE_USE_CARDS} from '../cards'
import {
	CurrentCoinFlipT,
	PlayerState,
	RowStateWithHermit,
	CardT,
	BattleLogT,
} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {CardPosModel, getCardPos} from './card-pos-model'
import {GameModel} from './game-model'
import {LineNode, formatText} from '../utils/formatting'
import {DEBUG_CONFIG} from '../config'
import Card from '../cards/base/card'
import {PickInfo} from '../types/server-requests'

export class BattleLogModel {
	private game: GameModel
	private logMessageQueue: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game

		/** Log entries that still need to be processed */
		this.logMessageQueue = []
	}

	private generateEffectEntryHeader(card: CardT | null): string {
		const currentPlayer = this.game.currentPlayer.playerName
		if (!card) return ''
		const cardInfo = CARDS[card.cardId]

		return `$p{You|${currentPlayer}}$ used $e${cardInfo.name}$ `
	}

	private generateCoinFlipDescription(coinFlip: CurrentCoinFlipT): string {
		const heads = coinFlip.tosses.filter((flip) => flip === 'heads').length
		const tails = coinFlip.tosses.filter((flip) => flip === 'tails').length

		if (coinFlip.tosses.length === 1) {
			return heads > tails ? `flipped $gheads$` : `flipped $btails$`
		} else if (tails === 0) {
			return `flipped $gall heads$`
		} else if (heads === 0) {
			return `flipped $ball tails$`
		} else {
			return `flipped $g${heads} heads$ and $b${tails} tails$`
		}
	}

	private generateCoinFlipMessage(attack: AttackModel, coinFlips: Array<CurrentCoinFlipT>): string {
		let entry = ''

		coinFlips.forEach((coinFlip) => {
			const description = this.generateCoinFlipDescription(coinFlip)

			if (HERMIT_CARDS[coinFlip.cardId] && !coinFlip.opponentFlip && attack.type !== 'effect') {
				entry = `${description}, then `
			} else if (SINGLE_USE_CARDS[coinFlip.cardId] && attack.type === 'effect') {
				entry = `${description}, then `
			}
		})

		return entry
	}

	public sendLogs() {
		while (this.logMessageQueue.length > 0) {
			const firstEntry = this.logMessageQueue.shift()
			if (!firstEntry) continue

			this.game.chat.push({
				createdAt: Date.now(),
				message: formatText(firstEntry.description),
				sender: firstEntry.player,
				systemMessage: true,
			})
		}

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addPlayCardEntry(card: Card, pos: CardPosModel, pickInfo?: PickInfo) {
		if (!card.log) return

		//@TODO Fix type checking
		//It possibly will crash if a log is written with data that is not possible to use for that log type

		const logMessage = card.log({
			player: pos.player.playerName,
			rowIndex: pos.rowIndex!,
			row: pos.row as RowStateWithHermit,
			header: `$p{You|${pos.player.playerName}}$ used $e${card.name}$ `,
			pickInfo: pickInfo!,
			pickedCardInfo: pickInfo ? CARDS[pickInfo!.card!.cardId] : CARDS['']!,
			slotType: pos.slot.type,
		})

		this.logMessageQueue.push({
			player: pos.player.id,
			description: logMessage,
		})

		this.sendLogs()
	}

	public addAttackEntry(
		attack: AttackModel,
		coinFlips: Array<CurrentCoinFlipT>,
		singleUse: CardT | null
	) {
		const attacker = attack.getAttacker()
		if (!attacker) return
		const playerId = attacker.player.id

		if (!playerId) return

		const attacks = [attack, ...attack.nextAttacks]

		let log = attacks.reduce((reducer, subAttack) => {
			if (!subAttack.log) return reducer

			const attacker = subAttack.getAttacker()
			const target = subAttack.getTarget()

			if (subAttack.type !== attack.type) {
				this.addAttackEntry(subAttack, coinFlips, singleUse)
				return reducer
			}

			if (!attacker || !target) return reducer

			if (subAttack.getDamage() === 0) return reducer

			const attackingHermitInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			const targetHermitInfo = CARDS[target.row.hermitCard.cardId]

			const targetFormatting = target.player.id === playerId ? 'p' : 'o'

			const attackName =
				subAttack.type === 'primary'
					? attackingHermitInfo.primary.name
					: attackingHermitInfo.secondary.name

			const logMessage = subAttack.log({
				attacker: `$p${attackingHermitInfo.name}$`,
				opponent: target.player.playerName,
				target: `$${targetFormatting}${targetHermitInfo.name}$`,
				attackName: `$v${attackName}$`,
				damage: `$b${subAttack.calculateDamage()}hp$`,
				header: this.generateEffectEntryHeader(singleUse),
				coinFlip: this.generateCoinFlipMessage(attack, coinFlips),
			})

			reducer += logMessage

			return reducer
		}, '' as string)

		if (log.length === 0) return

		log += DEBUG_CONFIG.logAttackHistory
			? attack.getHistory().reduce((reduce, hist) => {
					return reduce + `\n\t${hist.sourceId} → ${hist.type} ${hist.value}`
			  }, '')
			: ''

		this.logMessageQueue.unshift({
			player: playerId,
			description: log,
		})
	}

	public opponentCoinFlipEntry(coinFlips: Array<CurrentCoinFlipT>) {
		const player = this.game.currentPlayer
		// Opponent coin flips
		coinFlips.forEach((coinFlip) => {
			const cardName = CARDS[coinFlip.cardId].name
			if (!coinFlip.opponentFlip) return

			this.logMessageQueue.push({
				player: player.id,
				description: `$o${cardName}$ ${this.generateCoinFlipDescription(
					coinFlip
				)} on their coinflip`,
			})
		})
	}

	public addChangeHermitEntry(oldHermit: CardT | null, newHermit: CardT | null) {
		if (!oldHermit || !newHermit) return
		const player = getCardPos(this.game, oldHermit.cardInstance)?.player
		if (!player) return

		const currentPlayer = this.game.currentPlayer === player

		const oldHermitInfo = CARDS[oldHermit.cardId]
		const newHermitInfo = CARDS[newHermit.cardId]

		this.logMessageQueue.push({
			player: this.game.currentPlayer.id,
			description: `$p{You|${currentPlayer}}$ swapped $p${oldHermitInfo.name}$ for $p${newHermitInfo.name}$ on row ${player.board.activeRow}`,
		})
		this.sendLogs()
	}

	public addCustomEntry(entry: string, player: string) {
		this.logMessageQueue.push({
			player: player,
			description: entry,
		})
	}

	public addDeathEntry(playerState: PlayerState, row: RowStateWithHermit) {
		const card = row.hermitCard
		const cardName = CARDS[card.cardId].name

		const livesRemaining = 3 ? 'two lives' : 'one life'

		this.logMessageQueue.push({
			player: playerState.id,
			description: `$p${cardName}$ was knocked out, and {you|${playerState.playerName}} now {have|has} $b${livesRemaining}$ remaining`,
		})
		this.sendLogs()
	}

	public addTurnEndEntry() {
		this.game.chat.push({
			createdAt: Date.now(),
			message: new LineNode(),
			sender: this.game.opponentPlayer.id,
			systemMessage: true,
		})

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}
}
