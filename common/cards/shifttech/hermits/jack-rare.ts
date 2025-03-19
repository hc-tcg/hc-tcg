import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {flipCoin} from '../../../utils/coinFlips'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'
import AnarchistDoubleItem from '../../items/anarchist-rare'
import AthleteDoubleItem from '../../items/athlete-rare'
import BalancedDoubleItem from '../../items/balanced-rare'
import BardDoubleItem from '../../items/bard-rare'
import BuilderDoubleItem from '../../items/builder-rare'
import ChallengerDoubleItem from '../../items/challenger-rare'
import CollectorDoubleItem from '../../items/collector-rare'
import DiplomatDoubleItem from '../../items/diplomat-rare'
import ExplorerDoubleItem from '../../items/explorer-rare'
import FarmDoubleItem from '../../items/farm-rare'
import HistorianDoubleItem from '../../items/historian-rare'
import InventorDoubleItem from '../../items/inventor-rare'
import LooperDoubleItem from '../../items/looper-rare'
import MinerDoubleItem from '../../items/miner-rare'
import PacifistDoubleItem from '../../items/pacifist-rare'
import PranksterDoubleItem from '../../items/prankster-rare'
import PvPDoubleItem from '../../items/pvp-rare'
import RedstoneDoubleItem from '../../items/redstone-rare'
import ScavengerDoubleItem from '../../items/scavenger-rare'
import SpeedrunnerDoubleItem from '../../items/speedrunner-rare'
import TerraformDoubleItem from '../../items/terraform-rare'
import DoubleItemPlayedEffect from '../../../status-effects/double-item-played'

const JackRare: Hermit = {
	...hermit,
	id: 'jack_rare',
	numericId: 132,
	name: 'Jack',
	expansion: 'shifttech',
	rarity: 'rare',
	tokens: 1,
	type: ['builder'],
	health: 270,
	primary: {
		name: 'False Chunk',
		cost: ['builder'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Rebuild',
		cost: ['builder', 'builder', 'any'],
		damage: 90,
		power: 'Flip a coin.\nIf heads, you can play an additional item card this turn.\nIf you use a Double Item card, you cannot use an additional item card, regardless of the coin flip result.\nYou cannot use a Double Item card as the second item card.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(
			player.hooks.onAttach,
			(card) => {
				if (card.isItem() &&
					card.props.energy.length == 2 &&
					card.player == player &&
					!game.components.exists(
						StatusEffectComponent,
						query.effect.is(DoubleItemPlayedEffect),
						query.effect.targetIsPlayerAnd(query.player.entity(player.entity)),
					) &&
					query.every(query.card.active, query.card.is(JackRare))(
						game,
						component,
					)
				) {
					game.components
						.new(
							StatusEffectComponent,
							DoubleItemPlayedEffect,
							component.entity,
						)
						.apply(player.entity)
				}
			}
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!(attack.attacker instanceof CardComponent)) return

				const coinFlip = flipCoin(game, player, attack.attacker)

				if (
					game.components.exists(
						StatusEffectComponent,
						query.effect.is(DoubleItemPlayedEffect),
						query.effect.targetIsPlayerAnd(query.player.entity(player.entity)),
					)
				)
					return

				if (coinFlip[0] === 'heads') {
					game.removeCompletedActions('PLAY_ITEM_CARD')
					game.removeBlockedActions('game', 'PLAY_ITEM_CARD',)

					observer.subscribe(game.hooks.freezeSlots, () => {
						return query.every(
							query.slot.hand,
							query.slot.player(component.player.entity),
							query.slot.has(
								AnarchistDoubleItem,
								AthleteDoubleItem,
								BalancedDoubleItem,
								BardDoubleItem,
								BuilderDoubleItem,
								ChallengerDoubleItem,
								CollectorDoubleItem,
								DiplomatDoubleItem,
								ExplorerDoubleItem,
								FarmDoubleItem,
								HistorianDoubleItem,
								InventorDoubleItem,
								LooperDoubleItem,
								MinerDoubleItem,
								PacifistDoubleItem,
								PranksterDoubleItem,
								PvPDoubleItem,
								RedstoneDoubleItem,
								ScavengerDoubleItem,
								SpeedrunnerDoubleItem,
								TerraformDoubleItem,
							)
						)
					})
				}
			},
		)
	},
}

export default JackRare
