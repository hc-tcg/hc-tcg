import {
	CardComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {ObserverEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {isCounter} from 'common/status-effects/status-effect'
import {Hook, PriorityHook} from 'common/types/hooks'
import {GameController} from 'game-controller'

export const getOpponentId = (controller: GameController, playerId: string) => {
	const players = controller.viewers
		.filter((viewer) => !viewer.spectator)
		.map((viewer) => viewer.player)
	return players.filter((p) => p.id !== playerId)[0]?.id || null
}

export function printHooksState(game: GameModel) {
	const {currentPlayer, opponentPlayer} = game
	const cardsInfo: Record<string, any> = {}
	let instancesInfo: Record<string, any> = {}
	const customValues: Record<string, any> = {}

	// First loop to populate cardsInfo
	for (const player of [currentPlayer, opponentPlayer]) {
		for (const card of player.getDeck()) {
			cardsInfo[card.entity] = {
				card,
				player: player,
			}
		}
	}

	// Second loop to populate instancesInfo and customValues
	for (const player of [currentPlayer, opponentPlayer]) {
		// Instance Info
		for (const [hookName, hookValue] of [
			...Object.entries(player.hooks),
			...Object.entries(game.hooks),
		] satisfies [string, Hook<string, any> | PriorityHook<any, any>][]) {
			hookValue.listeners.forEach(([observer, _args, _key], i) => {
				let target = game.components.get(
					game.components.get(observer as ObserverEntity)?.wrappingEntity ||
						null,
				)
				if (!(target instanceof CardComponent)) return
				const pos = target.slot
				const inBoard = Boolean(pos)
				const instanceEntry = instancesInfo[target.entity] || {
					board: inBoard,
					hooks: [],
					card: cardsInfo[target.entity] && cardsInfo[target.entity].card,
					player: cardsInfo[target.entity] && cardsInfo[target.entity].player,
					type: pos?.type,
					index: pos.inRow() && pos?.index,
					row: pos.inRow() && pos?.row.index,
				}

				instanceEntry.hooks.push(`#${i + 1} | ${player.playerName}.${hookName}`)
				instancesInfo[target.entity] = instanceEntry
			})
		}

		// Sort by row
		instancesInfo = Object.fromEntries(
			Object.entries(instancesInfo).sort(([, valueA], [, valueB]) => {
				let aRow = valueA.row
				let bRow = valueB.row
				if (aRow === null && bRow === null) return 0
				if (aRow === null) return -1
				if (bRow === null) return 1
				return aRow - bRow
			}),
		)
	}

	// Helpers to print
	const colorize = (text: any, color: any) => {
		const colors: Record<string, string> = {
			reset: '\x1b[0m',
			blink: '\x1b[5m',
			black: '\x1b[30m',
			red: '\x1b[31m',
			green: '\x1b[32m',
			yellow: '\x1b[33m',
			blue: '\x1b[34m',
			magenta: '\x1b[35m',
			cyan: '\x1b[36m',
			white: '\x1b[37m',
			brightBlack: '\x1b[30;1m',
			brightRed: '\x1b[31;1m',
			brightGreen: '\x1b[32;1m',
			brightYellow: '\x1b[33;1m',
			brightBlue: '\x1b[34;1m',
			brightMagenta: '\x1b[35;1m',
			brightCyan: '\x1b[36;1m',
			brightWhite: '\x1b[37;1m',
		}

		return colors[color] + text + colors['reset']
	}

	const drawLine = (width: any) => {
		return '\u2550'.repeat(width)
	}

	const drawBox = (text: any, width: any) => {
		const lines = text.split('\n')
		const maxLength = Math.max(width, ...lines.map((line: any) => line.length))
		const top = `\u2554${drawLine(maxLength)}\u2557`
		const bottom = `\u255A${drawLine(maxLength)}\u255D`
		const middle = lines
			.map((line: any) => `\u2551 ${line.padEnd(maxLength - 2, ' ')} \u2551`)
			.join('\n')

		return `${top}\n${middle}\n${bottom}`
	}

	// Print to console
	if (game.settings.showHooksState.clearConsole) console.clear()
	const turnInfo = `TURN: ${game.state.turn.turnNumber}, CURRENT PLAYER: ${currentPlayer.playerName}`
	console.log(colorize(drawBox(turnInfo, 60), 'cyan'))

	for (const instance in instancesInfo) {
		const info = instancesInfo[instance]
		const slot = info.slot
		const row = info.row
		const attachedStatus = info.board
			? colorize('ATTACHED', 'green')
			: colorize('DETACHED', 'brightRed') +
				colorize(colorize('!', 'blink'), 'brightRed')
		const slotIndex = slot?.type === 'item' ? ':' + slot.index : ''
		const slotType = slot?.type ? slot.type : ''
		const rowIndex = row !== null ? 'Row: ' + row + ' - ' : ''

		if (info.player) {
			console.log(
				`${info.player.playerName} | ${rowIndex}${slotType}${slotIndex}${slotType ? ' | ' : ''}${
					info.card.cardId
				} - ${attachedStatus}`,
			)
			console.log(colorize(drawLine(60), 'white'))
		}

		for (const hook of info.hooks) {
			console.log(colorize(hook, 'brightYellow'))
		}

		const custom = customValues[instance]
		if (custom) {
			let output = custom.keyName
				? custom.keyName + ' = ' + custom.value
				: custom.id + ':' + instance + ' = ' + custom.value
			console.log(colorize(output, 'brightMagenta'))
		}

		console.log('\n')
	}
}

/** A utility to print a game board state in the command line. This is intended to be used for developing tests. */
export function printBoardState(game: GameModel) {
	let buffer = []

	buffer.push(game.logHeader + '\n')

	const printSlot = (slot: SlotComponent) => {
		let card = slot.getCard()

		if (card) {
			let name = card.props.name
			if (card.turnedOver) name = '?' + name

			if (
				slot.inRow() &&
				slot.row.entity === slot.player.activeRowEntity &&
				slot.type === 'hermit'
			) {
				name = '*' + name + ' ' + card.props.rarity[0].toUpperCase()
			}

			buffer.push(name.slice(0, 10).padEnd(11))
			if (slot.type === 'hermit' && slot.inRow() && slot.row.health) {
				buffer.push(slot.row.health)
				if (card.turnedOver) buffer.push('?')

				buffer.push(
					...game.components
						.filter(
							StatusEffectComponent,
							query.effect.targetIsCardAnd(query.card.slotEntity(slot.entity)),
						)
						.map(
							(e) => e.props.name + (isCounter(e.props) ? ' ' + e.counter : ''),
						)
						.join(', '),
				)
			}
		} else {
			buffer.push('_'.padEnd(11))
		}
	}

	for (const playerEntity of game.state.order) {
		const player = game.components.get(playerEntity)
		let isTurn = game.currentPlayer.entity === playerEntity
		buffer.push('\t')
		buffer.push(player?.playerName || '')
		buffer.push('\t')
		buffer.push(isTurn ? 'Active' : 'Inactive')
		buffer.push('\n')

		for (let i = 0; i < 5; i++) {
			buffer.push('\t')

			game.components
				.filter(
					SlotComponent,
					query.slot.player(playerEntity),
					query.slot.item,
					query.slot.row(query.row.index(i)),
				)
				.forEach(printSlot)
			game.components
				.filter(
					SlotComponent,
					query.slot.player(playerEntity),
					query.slot.attach,
					query.slot.row(query.row.index(i)),
				)
				.forEach(printSlot)
			game.components
				.filter(
					SlotComponent,
					query.slot.player(playerEntity),
					query.slot.hermit,
					query.slot.row(query.row.index(i)),
				)
				.forEach(printSlot)
			buffer.push('\n')
		}

		buffer.push('\t')
		buffer.push('Hand: ')
		game.components
			.filter(
				SlotComponent,
				query.slot.player(playerEntity),
				query.slot.hand,
				query.not(query.slot.empty),
			)
			.forEach(printSlot)
		buffer.push('\n')

		buffer.push('\t')
		buffer.push('Status Effects: ')
		buffer.push(
			...game.components
				.filter(StatusEffectComponent, query.effect.targetEntity(playerEntity))
				.map((e) => e.props.name + (isCounter(e.props) ? ' ' + e.counter : ''))
				.join(', '),
		)
		buffer.push('\n\n')
	}

	buffer.push('\t')
	buffer.push('Single Use Slot: ')
	game.components.filter(SlotComponent, query.slot.singleUse).forEach(printSlot)
	buffer.push(`Single Use Activated: ${game.currentPlayer.singleUseCardUsed}`)
	buffer.push('\n')

	console.info(buffer.join(''))
}

/** Call a function and log errors if they are found. This function is used to prevent errors from reaching
 * the root of the tree.
 */
export function* safeCall(fun: any, ...args: any[]): any {
	try {
		return yield* fun(...args)
	} catch (e) {
		console.error(e)
	}
}
