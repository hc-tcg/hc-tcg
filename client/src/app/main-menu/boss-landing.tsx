import {CARDS} from 'common/cards'
import {EXPANSIONS} from 'common/const/expansions'
import {CardEntity} from 'common/entities'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import MenuLayout from 'components/menu-layout'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

function createUICardInstance(cardId: string): LocalCardInstance {
	return {
		props: WithoutFunctions(CARDS[cardId].props),
		entity: cardId as CardEntity,
		slot: null,
		turnedOver: false,
		attackHint: null,
	} as const
}

function removeDisabledExpansions(cardId: string) {
	return !EXPANSIONS[CARDS[cardId].props.expansion].disabled
}

function BossLanding({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const handleCreateBossGame = () => {
		setMenuSection('mainmenu')
		dispatch({type: localMessages.MATCHMAKING_BOSS_GAME_CREATE})
	}

	const nonFunctionalCards = [
		'knockback',
		'lead',
		'looting',
		'spyglass',
		'bow',
		'splash_potion_of_poison',
		'lava_bucket',

		'egg',
		'potion_of_slowness',
		'target_block',

		//'dropper',
		//'glowstone',
		//'berry_bush',
	]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	const directlyOppositeCards = ['anvil', 'renbob_rare', 'poepoeskizz_rare']
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	return (
		<MenuLayout
			back={() => setMenuSection('mainmenu')}
			title="Challenge Evil X"
			returnText="Main Menu"
			className={css.bossLanding}
		>
			<CardList cards={[createUICardInstance('evilxisuma_boss')]} />
			<div className={css.bossRules}>
				<p>
					That's right, the Hermitcraft TCG has its first boss fight! This is no
					challenge deck, Evil X cares not for the cards. He brings his own
					moves, and they are vicious! If you think you can defeat him, you'll
					need to bring your best game. Be sure to check your audio settings to
					hear the voice commands during the battle.
				</p>
				<h1>Rules</h1>
				<p>You will always go first but can only have three rows to play on.</p>
				<p>
					EX has only one row to play on and has no item slots to attach to his
					boss card. However, his card has 300hp, comes back again at full
					health when knocked out, and will perform harder attacks with every
					life lost.
				</p>
				{directlyOppositeCards.length
					? [
							<p>
								EX is always directly opposite your active Hermit for the
								purposes of:
							</p>,
							<div>
								<CardList cards={directlyOppositeCards} wrap={true} />
							</div>,
						]
					: undefined}
				<p>
					EX is immune to and cannot be inflicted with Fire, Poison, and
					Slowness.
				</p>
				<p>The following cards don't work in this battle:</p>
				<div>
					<CardList cards={nonFunctionalCards} wrap={true} />
				</div>
				<h1>EX's Moves & Special</h1>
				<p>Evil X can attack for 50, 70 or 90 damage.</p>
				<p>
					After losing a life, EX can also either heal for 150hp, set your
					active Hermit on fire, or double the damage of his main attack.
				</p>
				<p>
					On his last life, EX can deal 20 damage to all AFK Hermits, discard
					your active Hermit's attached effect card, or force you to discard an
					item card from your active Hermit. Discarded effect cards act as if{' '}
					<u>Curse of Vanishing</u> was used and do not trigger from his attack.
				</p>
				<p>
					If a special move disables EX's attack, this only prevents attack
					damage, being set on fire and damage against AFK Hermits.
				</p>
				<p>
					At the end of EX's ninth turn, even if he cannot attack, he will
					perform one of two special moves:
				</p>
				<ol>
					<li>Discard your whole hand and draw one new card.</li>
					<li>
						Remove all attached item and effect cards from your active Hermit.
					</li>
				</ol>
			</div>
			<Button variant="stone" onClick={handleCreateBossGame}>
				Begin Boss Game
			</Button>
		</MenuLayout>
	)
}

export default BossLanding
