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
import {CardPosModel} from './card-pos-model'
import {GameModel} from './game-model'
import {LineNode, formatText} from '../utils/formatting'
import {DEBUG_CONFIG} from '../config'
import Card from '../cards/base/card'
import {PickInfo} from '../types/server-requests'
import StatusEffect from '../status-effects/status-effect'

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
			return `flipped $g${heads} heads$`
		} else if (heads === 0) {
			return `flipped $b${tails} tails$`
		} else {
			return `flipped $g${heads} heads$ and $b${tails} tails$`
		}
	}

	private generateCoinFlipMessage(
		attack: AttackModel,
		coinFlips: Array<CurrentCoinFlipT>
	): string | null {
		const entry = coinFlips.reduce((r: string | null, coinFlip) => {
			const description = this.generateCoinFlipDescription(coinFlip)

			if (coinFlip.opponentFlip) return r
			if (HERMIT_CARDS[coinFlip.cardId] && attack.type === 'effect') return r
			if (SINGLE_USE_CARDS[coinFlip.cardId] && attack.type !== 'effect') return r

			return description
		}, null)

		return entry
	}

	public async sendLogs() {
		while (this.logMessageQueue.length > 0) {
			const firstEntry = this.logMessageQueue.shift()
			if (!firstEntry) continue

			this.game.chat.push({
				createdAt: Date.now(),
				message: formatText(firstEntry.description, {censor: true}),
				sender: firstEntry.player,
				systemMessage: true,
			})
		}

		await new Promise((e) =>
			setTimeout(
				e,
				this.game.currentPlayer.coinFlips.reduce((r, flip) => r + flip.delay, 0)
			)
		)

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addPlayCardEntry(
		card: Card,
		pos: CardPosModel,
		coinFlips: Array<CurrentCoinFlipT>,
		pickInfo?: PickInfo
	) {
		const getCardName = (
			player: PlayerState | undefined,
			cardId: string | undefined,
			rowIndex: number | null | undefined
		) => {
			if (!cardId) return invalid
			const cardInfo = CARDS[cardId]
			if (cardInfo.type === 'item') {
				return `${cardInfo.name} ${cardInfo.rarity === 'rare' ? ' item x2' : 'item'}`
			}

			if (
				cardInfo.type === 'hermit' &&
				player &&
				player.board.activeRow !== rowIndex &&
				rowIndex !== null &&
				rowIndex !== undefined
			) {
				return `${cardInfo.name} (${rowIndex + 1})`
			}

			return `${cardInfo.name}`
		}

		const thisFlip = coinFlips.find((flip) => flip.cardId === card.id)
		const invalid = '$bINVALID VALUE$'

		const pickInfoPlayer = () => {
			if (!pickInfo) return undefined
			if (this.game.currentPlayer.id === pickInfo.playerId) return this.game.currentPlayer
			return this.game.opponentPlayer
		}

		const pickedPlayer = pickInfoPlayer()

		const logMessage = card.getLog({
			player: pos.player.playerName,
			opponent: pos.opponentPlayer.playerName,
			coinFlip: thisFlip ? this.generateCoinFlipDescription(thisFlip) : '',
			defaultLog: `$p{You|${pos.player.playerName}}$ used $e${card.name}$`,
			pos: {
				rowIndex: pos.rowIndex !== null ? `${pos.rowIndex + 1}` : invalid,
				id: pos.card ? pos.card.cardId : invalid,
				name: pos.card ? getCardName(pos.player, pos.card.cardId, pos.rowIndex) : invalid,
				hermitCard: pos.row?.hermitCard
					? getCardName(pos.player, pos.row.hermitCard.cardId, pos.rowIndex)
					: invalid,
				slotType: pos.slot.type,
			},
			pick: {
				rowIndex:
					pickInfo && pickInfo.rowIndex !== undefined ? `${pickInfo.rowIndex + 1}` : invalid,
				id: pickInfo?.card ? pickInfo.card.cardId : invalid,
				name: pickInfo?.card
					? getCardName(pickedPlayer, pickInfo.card.cardId, pickInfo.rowIndex)
					: invalid,
				hermitCard:
					pickInfo && pickInfo.rowIndex !== null && pickInfo.rowIndex !== undefined && pickedPlayer
						? getCardName(
								pickedPlayer,
								pickedPlayer.board.rows[pickInfo.rowIndex].hermitCard?.cardId,
								pickInfo.rowIndex
						  )
						: invalid,
				slotType: pickInfo ? pickInfo.slot.type : invalid,
			},
		})

		if (logMessage.length === 0) return

		this.logMessageQueue.unshift({
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

			const rowNumberString =
				target.player.board.activeRow === target.rowIndex ? '' : `(${target.rowIndex + 1})`

			const attackName =
				subAttack.type === 'primary'
					? attackingHermitInfo.primary.name
					: attackingHermitInfo.secondary.name

			const logMessage = subAttack.getLog({
				attacker: `$p${attackingHermitInfo.name}$`,
				player: attacker.player.playerName,
				opponent: target.player.playerName,
				target: `$${targetFormatting}${targetHermitInfo.name} ${rowNumberString}$`,
				attackName: `$v${attackName}$`,
				damage: `$b${subAttack.calculateDamage()}hp$`,
				defaultLog: this.generateEffectEntryHeader(singleUse),
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

		this.logMessageQueue.push({
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

	public addEntry(player: string, entry: string) {
		this.logMessageQueue.push({
			player: player,
			description: entry,
		})
	}

	public addChangeRowEntry(
		player: PlayerState,
		newRow: number,
		oldHermit: CardT | null,
		newHermit: CardT | null
	) {
		if (!newHermit) return
		const newHermitInfo = CARDS[newHermit.cardId]

		if (oldHermit) {
			const oldHermitInfo = CARDS[oldHermit.cardId]

			this.logMessageQueue.push({
				player: player.id,
				description: `$p{You|${player.playerName}}$ swapped $p${oldHermitInfo.name}$ for $p${
					newHermitInfo.name
				} (${newRow + 1})$`,
			})
		} else {
			this.logMessageQueue.push({
				player: player.id,
				description: `$p{You|${player.playerName}}$ activated $p${newHermitInfo.name} (${
					newRow + 1
				})$`,
			})
		}
	}

	public addDeathEntry(player: PlayerState, row: RowStateWithHermit) {
		const card = row.hermitCard
		const cardName = CARDS[card.cardId].name

		const livesRemaining = player.lives === 3 ? 'two lives' : 'one life'

		this.logMessageQueue.push({
			player: player.id,
			description: `$p${cardName}$ was knocked out, and $p{you|${player.playerName}}$ now {have|has} $b${livesRemaining}$ remaining`,
		})
		this.sendLogs()
	}

	public addTurnEndEntry() {
		this.game.chat.push({
			createdAt: Date.now(),
			message: {TYPE: 'LineNode'},
			sender: this.game.opponentPlayer.id,
			systemMessage: true,
		})

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addRemoveStatusEffectEntry(statusEffect: StatusEffect) {
		this.logMessageQueue.push({
			player: this.game.currentPlayer.id,
			description: `$e${statusEffect.name}$ wore off`,
		})
		this.sendLogs()
	}
}
