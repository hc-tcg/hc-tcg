import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
import {AttackModel} from '../../../../server/models/attack-model'
import {getCardPos} from '../../../../server/utils/cards'
import {GameModel} from '../../../../server/models/game-model'

/*
Questions:
- What to do when grian/emerald movees tutlrte shell to active hermit?
	- Should it active immediately or require the hermit to go afk and active again?
	- What about the hermit that got his shell stolen? Is he protected anyway or can he be damaged now?
*/

/*
Situations:
- Opponent has turtle_shell on him at start of turn
	- Players attacks (prevents damage -> tutrtle shell discarded)
	- Opponent is made afk (turtle shell discarded form now afk hermit)
	- Player just ends turn (turtle shell discarded)
- Opponent receives turtle shell through emerald
	- Same as above ^
- Opponent receives turtle shell through attack special move
	- Shouldn't be possible right now there is no special moves that put effect on opponent
*/

/*
Testing:
- Must work with hypno (effect not applied when attacking AFK)
- Must work with XB/URTFC/golden axe - tutrtle shell is ignored
- Must work with Zed's sheep stare (Zed's opponent should still receive damage either way)
*/

class TurtleShellEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'turtle_shell',
			name: 'Turtle Shell',
			rarity: 'rare',
			description:
				'Attach to any of your afk hermits. When the hermit is made active, it prevents any damage for its first turn and then is discarded.',
		})

		this.instances = {}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		if (!pos.rowState?.hermitCard) return 'NO'

		// turtle shell addition - hermit must be inactive to attach
		if (!(currentPlayer.board.activeRow !== pos.rowIndex)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		//@TODO just look at all this sad boilerplate
		const info = getCardPos(game, instance)
		if (!info) return
		const {playerState} = info

		const instanceKey = this.getKey(instance)
		playerState.custom[instanceKey] = false
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onSetActive(game, instance) {
		const pos = getCardPos(game, instance)
		if (!pos) return true
		const {playerState} = pos

		// This card will now block all damage till the end of the turn
		const instanceKey = this.getKey(instance)
		playerState.custom[instanceKey] = true

		return true
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
		const pos = getCardPos(game, instance)
		if (!pos || attack.type === 'ailment') return attack
		const {playerState} = pos

		// If ability active, block all damage
		const instanceKey = this.getKey(instance)
		if (playerState.custom[instanceKey] === true) {
			const types = attack.getDamageTypes()

			for (let i = 0; i < types.length; i++) {
				const type = types[i]
				attack.multiplyDamage(type, 0).lockDamage(type)
			}
		}

		return attack
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onTurnEnd(game, instance) {
		const pos = getCardPos(game, instance)
		if (!pos) return
		const {playerState} = pos

		// End of turn, if active, remove flag and discard
		const instanceKey = this.getKey(instance)
		if (playerState.custom[instanceKey] === true) {
			delete playerState.custom[instanceKey]
		}
	}
}

export default TurtleShellEffectCard
