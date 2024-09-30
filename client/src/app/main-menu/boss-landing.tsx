import PoePoeSkizzRare from 'common/cards/alter-egos-iii/hermits/poepoeskizz-rare'
import RenbobRare from 'common/cards/alter-egos/hermits/renbob-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import Egg from 'common/cards/alter-egos/single-use/egg'
import PotionOfSlowness from 'common/cards/alter-egos/single-use/potion-of-slowness'
import TargetBlock from 'common/cards/alter-egos/single-use/target-block'
import {Card} from 'common/cards/base/types'
import EvilXisumaBossHermitCard from 'common/cards/boss/hermits/evilxisuma_boss'
import Bow from 'common/cards/default/single-use/bow'
import Knockback from 'common/cards/default/single-use/knockback'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import Lead from 'common/cards/default/single-use/lead'
import Looting from 'common/cards/default/single-use/looting'
import SplashPotionOfPoison from 'common/cards/default/single-use/splash-potion-of-poison'
import Spyglass from 'common/cards/default/single-use/spyglass'
import {EXPANSIONS} from 'common/const/expansions'
import {CardEntity} from 'common/entities'
import {LocalCardInstance, WithoutFunctions} from 'common/types/server-requests'
import Button from 'components/button'
import CardList from 'components/card-list'
import MenuLayout from 'components/menu-layout'
import {localMessages, useMessageDispatch} from 'logic/messages'
import css from './main-menu.module.scss'
import Modal from 'components/modal'
import {useState} from 'react'

type Props = {
	setMenuSection: (section: string) => void
}

function createUICardInstance(card: Card): LocalCardInstance {
	return {
		props: WithoutFunctions(card),
		entity: card.id as CardEntity,
		slot: null,
		turnedOver: false,
		attackHint: null,
	} as const
}

function removeDisabledExpansions(card: Card) {
	return !EXPANSIONS[card.expansion].disabled
}

function BossLanding({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()
	const [evilXOpen, setEvilXOpen] = useState<boolean>(false)

	const handleCreateBossGame = () => {
		setMenuSection('mainmenu')
		dispatch({type: localMessages.MATCHMAKING_BOSS_GAME_CREATE})
	}

	const nonFunctionalCards = [
		Knockback,
		Lead,
		Looting,
		Spyglass,
		Bow,
		SplashPotionOfPoison,
		LavaBucket,

		Egg,
		PotionOfSlowness,
		TargetBlock,

		// Dropper,
		// Glowstone,
		// BerryBush,
	]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	const directlyOppositeCards = [Anvil, RenbobRare, PoePoeSkizzRare]
		.filter(removeDisabledExpansions)
		.map(createUICardInstance)

	return (
		<>
			{evilXOpen && (
				<Modal title={'Rules'} closeModal={() => setEvilXOpen(!evilXOpen)}>
					<div className={css.bossRules}>
						<p>
							That's right, the Hermitcraft TCG has its first boss fight! This
							is no challenge deck, Evil X cares not for the cards. He brings
							his own moves, and they are vicious! If you think you can defeat
							him, you'll need to bring your best game. Be sure to check your
							audio settings to hear the voice commands during the battle.
						</p>
						<h1>Rules</h1>
						<p>
							You will always go first but can only have three rows to play on.
						</p>
						<p>
							EX has only one row to play on and has no item slots to attach to
							his boss card. However, his card has 300hp, comes back again at
							full health when knocked out, and will perform harder attacks with
							every life lost.
						</p>
						{directlyOppositeCards.length
							? [
									<p>
										EX is always directly opposite your active Hermit for the
										purposes of:
									</p>,
									<div>
										<CardList
											cards={directlyOppositeCards}
											wrap={true}
											displayTokenCost={false}
										/>
									</div>,
								]
							: undefined}
						<p>
							EX is immune to and cannot be inflicted with Fire, Poison, and
							Slowness.
						</p>
						<p>The following cards don't work in this battle:</p>
						<div>
							<CardList
								cards={nonFunctionalCards}
								wrap={true}
								displayTokenCost={false}
							/>
						</div>
						<h1>EX's Moves & Special</h1>
						<p>Evil X can attack for 50, 70 or 90 damage.</p>
						<p>
							After losing a life, EX can also either heal for 150hp, set your
							active Hermit on fire, or double the damage of his main attack.
						</p>
						<p>
							On his last life, EX can deal 20 damage to all AFK Hermits,
							discard your active Hermit's attached effect card, or force you to
							discard an item card from your active Hermit. Discarded effect
							cards act as if <u>Curse of Vanishing</u> was used and do not
							trigger from his attack.
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
								Remove all attached item and effect cards from your active
								Hermit.
							</li>
						</ol>
					</div>
				</Modal>
			)}
			<MenuLayout
				back={() => setMenuSection('mainmenu')}
				title="Single Player"
				returnText="Main Menu"
				className={css.bossLanding}
			>
				<div className={css.singleBossArea}>
					<img
						src={'images/hermits-nobg/evilxisuma.png'}
						className={css.bossImage}
					></img>
					<Button variant="default" onClick={() => setEvilXOpen(true)}>
						View Rules
					</Button>
					<Button variant="default" onClick={handleCreateBossGame}>
						Challenge Evil X
					</Button>
				</div>
			</MenuLayout>
		</>
	)
}

export default BossLanding
