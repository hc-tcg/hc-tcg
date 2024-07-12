import {
	CurrentCoinFlipT,
	PlayerComponent,
	BattleLogT,
	StatusEffectInstance,
} from '../types/game-state'
import {broadcast} from '../../server/src/utils/comm'
import {AttackModel} from './attack-model'
import {GameModel} from './game-model'
import {formatText} from '../utils/formatting'
import {DEBUG_CONFIG} from '../config'
import Card from '../cards/base/card'
import StatusEffect, {statusEffect, StatusEffectLog} from '../status-effects/status-effect'
import {SlotInfo} from '../types/cards'
import { CardComponent, SlotComponent } from '../components'

export class BattleLogModel {
	private game: GameModel
	private logMessageQueue: Array<BattleLogT>

	constructor(game: GameModel) {
		this.game = game

		/** Log entries that still need to be processed */
		this.logMessageQueue = []
	}

	private generateEffectEntryHeader(card: CardComponent | null): string {
		const currentPlayer = this.game.currentPlayer.playerName
		if (!card) return ''
		return `$p{You|${currentPlayer}}$ used $e${card.props.name}$ `
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
			if (coinFlip.card.card.isHermit() && attack.type === 'effect') return r
			if (coinFlip.card.card.isHermit() && attack.type !== 'effect') return r

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
		card: CardComponent,
		coinFlips: Array<CurrentCoinFlipT>,
		pos: SlotComponent | null,
	) {
		let {player, opponentPlayer} = card

		const genCardName = (
			player: PlayerComponent | undefined,
			card: CardComponent | null | undefined,
			rowIndex: number | null | undefined
		) => {
			if (card == null) return invalid

			if (
				card.props.category === 'hermit' &&
				player &&
				player.board.activeRow !== rowIndex &&
				rowIndex !== null &&
				rowIndex !== undefined
			) {
				return `${card.props.name} (${rowIndex + 1})`
			}

			return `${card.props.name}`
		}

		const thisFlip = coinFlips.find((flip) => flip.card.card.props.id === card.props.id)
		const invalid = '$bINVALID VALUE$'

		const logMessage = card.getLog({
			player: player.playerName,
			opponent: opponentPlayer.playerName,
			coinFlip: thisFlip ? this.generateCoinFlipDescription(thisFlip) : '',
			defaultLog: `$p{You|${player.playerName}}$ used $e${card.props.name}$`,
			pos: {
				rowIndex: pos.rowIndex !== null ? `${pos.rowIndex + 1}` : invalid,
				id: pos.cardId ? pos.cardId.card.props.id : invalid,
				name: pos.cardId ? genCardName(pos.player, pos.cardId, pos.rowIndex) : invalid,
				hermitCard: genCardName(pos.player, pos.rowId?.hermitCard, pos.rowIndex),
				slotType: pos.type,
			},
			pick: {
				rowIndex: slotInfo && slotInfo.rowIndex !== null ? `${slotInfo.rowIndex + 1}` : invalid,
				id: slotInfo?.cardId ? slotInfo.cardId.card.props.id : invalid,
				name: genCardName(slotInfo?.player, slotInfo?.cardId, slotInfo?.rowIndex),
				hermitCard: genCardName(
					slotInfo?.player,
					slotInfo?.rowIndex ? slotInfo?.player.board.rows[slotInfo?.rowIndex].hermitCard : null,
					slotInfo?.rowIndex
				),
				slotType: slotInfo ? slotInfo.type : invalid,
			},
		})

		if (logMessage.length === 0) return

		this.logMessageQueue.unshift({
			player: pos.player.entity,
			description: logMessage,
		})

		this.sendLogs()
	}

	public addAttackEntry(
		attack: AttackModel,
		coinFlips: Array<CurrentCoinFlipT>,
		singleUse: CardComponent | null
	) {
		if (!attack.attacker) return
		const playerId = attack.attacker.player.entity

		if (!playerId) return

		const attacks = [attack, ...attack.nextAttacks]

		let log = attacks.reduce((reducer, subAttack) => {
			if (subAttack.type !== attack.type) {
				this.addAttackEntry(subAttack, coinFlips, singleUse)
				return reducer
			}

			if (!attack.attacker || !attack.target) return reducer

			if (subAttack.getDamage() === 0) return reducer

			const attackingHermitInfo = attack.attacker
			const targetHermitInfo = this.game.state.cards.find(
				card.hermit,
				card.row(attack.target.entity)
			)

			const targetFormatting = attack.target.player.entity === playerId ? 'p' : 'o'

			const rowNumberString = `(${attack.target.index + 1})`

			if (!(attackingHermitInfo instanceof CardComponent)) return reducer
			if (!attackingHermitInfo.isHermit()) return reducer

			const attackName =
				subAttack.type === 'primary'
					? attackingHermitInfo.props.primary.name
					: attackingHermitInfo.props.secondary.name

			const logMessage = subAttack.getLog({
				attacker: `$p${attackingHermitInfo.props.name}$`,
				player: attack.attacker.player.playerName,
				opponent: attack.target.player.playerName,
				target: `$${targetFormatting}${targetHermitInfo?.props?.name} ${rowNumberString}$`,
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
					return reduce + `\n\t${hist.source} → ${hist.type} ${hist.value}`
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
			if (!coinFlip.opponentFlip) return

			this.logMessageQueue.push({
				player: player.entity,
				description: `$o${coinFlip.card.props.name}$ ${this.generateCoinFlipDescription(
					coinFlip
				)} on their coinflip`,
			})
		})
	}

	public addEntry(player: PlayerEntity, entry: string) {
		this.logMessageQueue.push({
			player: player,
			description: entry,
		})
	}

	public addChangeRowEntry(
		player: PlayerComponent,
		newRowEntity: RowEntity,
		oldHermitEntity: CardEntity | null,
		newHermitEntity: CardEntity | null
	) {
		let newRow = this.game.state.rows.get(newRowEntity)
		let oldHermit = this.game.state.cards.get(oldHermitEntity)
		let newHermit = this.game.state.cards.get(newHermitEntity)

		if (!newRow || !oldHermit || !newHermit) return

		if (oldHermit) {
			this.logMessageQueue.push({
				player: player.entity,
				description: `$p{You|${player.playerName}}$ swapped $p${oldHermit.props.name}$ for $p${
					newHermit.props.name
				} (${newRow.index + 1})$`,
			})
		} else {
			this.logMessageQueue.push({
				player: player.entity,
				description: `$p{You|${player.playerName}}$ activated $p${newHermit.props.name} (${
					newRow.index + 1
				})$`,
			})
		}
	}

	public addDeathEntry(player: PlayerComponent, row: RowEntity) {
		const hermitCard = this.game.state.cards.find(card.hermit, card.row(row))
		if (!hermitCard) return
		const cardName = hermitCard.props.name

		const livesRemaining = player.lives === 3 ? 'two lives' : 'one life'

		this.logMessageQueue.push({
			player: player.entity,
			description: `$p${cardName}$ was knocked out, and $p{you|${player.playerName}}$ now {have|has} $b${livesRemaining}$ remaining`,
		})
		this.sendLogs()
	}

	public addTurnEndEntry() {
		this.game.chat.push({
			createdAt: Date.now(),
			message: {TYPE: 'LineNode'},
			sender: this.game.opponentPlayer.entity,
			systemMessage: true,
		})

		broadcast(this.game.getPlayers(), 'CHAT_UPDATE', this.game.chat)
	}

	public addStatusEffectEntry(
		statusEffect: StatusEffectInstance,
		log: (values: StatusEffectLog) => string
	) {
		const pos = getCardPos(this.game, statusEffect.targetInstance)
		if (!pos || !pos.rowIndex) return
		const targetFormatting = pos.player.id === this.game.currentPlayerEntity ? 'p' : 'o'
		const rowNumberString =
			pos.player.board.activeRow === pos.rowIndex ? '' : `(${pos.rowIndex + 1})`

		const logMessage = log({
			target: `$${targetFormatting}${statusEffect.targetInstance.props.name} ${rowNumberString}$`,
			statusEffect: `$e${statusEffect.props.name}$`,
		})

		this.logMessageQueue.push({
			player: this.game.currentPlayerEntity,
			description: logMessage,
		})

		this.sendLogs()
	}
}
