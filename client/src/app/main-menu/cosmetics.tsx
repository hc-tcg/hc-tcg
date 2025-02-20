import cn from 'classnames'
import {ACHIEVEMENTS, ACHIEVEMENTS_LIST} from 'common/achievements'
import {ALL_COSMETICS} from 'common/cosmetics'
import {
	Background,
	Border,
	Coin,
	Cosmetic,
	Heart,
	Title,
} from 'common/cosmetics/types'
import Button from 'components/button'
import Dropdown from 'components/dropdown'
import MenuLayout from 'components/menu-layout'
import {
	getAchievements,
	getAppearance,
} from 'logic/game/database/database-selectors'
import {localMessages} from 'logic/messages'
import {getSession} from 'logic/session/session-selectors'
import {useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './cosmsetics.module.scss'
import Tabs from 'components/tabs/tabs'
import AchievementComponent from 'components/achievement'
import {Achievement} from 'common/achievements/types'
import Tooltip from 'components/tooltip'
import CardInstanceTooltip from 'components/card/card-tooltip'
import {CARDS} from 'common/cards'
import {WithoutFunctions} from 'common/types/server-requests'
import Card from 'components/card'

type Props = {
	setMenuSection: (section: string) => void
}

export function CosmeticPreview() {
	const {playerName, minecraftName} = useSelector(getSession)
	const appearance = useSelector(getAppearance)
	const health = (lives: number) => {
		const hearts = new Array(3).fill(null).map((_, index) => {
			const heartImg =
				lives > index
					? `/images/cosmetics/heart/${appearance.heart.id}.png`
					: '/images/game/heart_empty.png'
			return (
				<img
					key={index}
					className={css.heart}
					src={heartImg}
					width="32"
					height="32"
				/>
			)
		})
		return hearts
	}

	const previewStyle = {
		borderImageSource:
			appearance.border.id === 'blue'
				? undefined
				: `url(/images/cosmetics/border/${appearance.border.id}.png)`,
		backgroundImage:
			appearance.background.id === 'transparent'
				? undefined
				: `url(/images/cosmetics/background/${appearance.background.id}.png)`,
	}

	return (
		<div className={css.cosmeticPreview}>
			<div className={css.appearanceContainer} style={previewStyle}>
				<img
					className={css.playerHead}
					src={`https://mc-heads.net/head/${minecraftName}/right`}
					alt="player head"
				/>
				<div className={css.playerName}>
					<h1>{playerName}</h1>
					<p className={css.title}>{appearance.title.name}</p>
				</div>

				<div className={css.health}>{health(3)}</div>
			</div>
		</div>
	)
}

const CosmeticItem = ({cosmetic}: {cosmetic: Cosmetic}) => {
	const dispatch = useDispatch()
	const achievementProgress = useSelector(getAchievements)

	const [selectedCosmetic, setSelectedCosmetic] =
		useState<Cosmetic['type']>('title')
	const appearance = useSelector(getAppearance)
	const selectableCosmetics = ALL_COSMETICS.filter(
		(cosmetic) => cosmetic.type === selectedCosmetic,
	)
	const selected = appearance[selectedCosmetic]

	let isUnlocked = true

	let isSelected = selected.id === cosmetic.id
	const item = (
		<div
			className={cn(css.cosmeticItem, {
				[css.unlocked]: isUnlocked,
				[css.selected]: isSelected,
			})}
			onClick={() =>
				dispatch({
					type: localMessages.COSMETIC_UPDATE,
					cosmetic: cosmetic,
				})
			}
		>
			<div className={css.cosmeticName}>{cosmetic.name}</div>
			{!isUnlocked && (
				<div className={css.lockOverlay}>
					<img src="/images/lock.png" />
				</div>
			)}
		</div>
	)

	const achievement = cosmetic.requires ? ACHIEVEMENTS[cosmetic.requires] : null

	if (cosmetic.requires && achievement) {
		isUnlocked = !!achievementProgress[achievement.numericId]?.completionTime
	}

	const tooltip = achievement ? (
		<div className={css.tooltip}>
			<b>{achievement.name}</b>
			<p>{achievement.description}</p>
		</div>
	) : (
		<div></div>
	)

	return achievement ? <Tooltip tooltip={tooltip}>{item}</Tooltip> : item
}

function Cosmetics({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const [selectedCosmetic, setSelectedCosmetic] =
		useState<Cosmetic['type']>('title')
	const achievementProgress = useSelector(getAchievements)
	const appearance = useSelector(getAppearance)
	const selectableCosmetics = ALL_COSMETICS.filter(
		(cosmetic) => cosmetic.type === selectedCosmetic,
	)
	const selected = appearance[selectedCosmetic]
	const [tab, selectTab] = useState<'achievements' | 'rewards'>('achievements')
	const progressData = useSelector(getAchievements)

	// const usernameRef = useRef<HTMLInputElement>(null)
	// const minecraftNameRef = useRef<HTMLInputElement>(null)

	const sortedCosmetics = ALL_COSMETICS.reduce(
		(
			r: {
				background: Array<Background>
				title: Array<Title>
				coin: Array<Coin>
				heart: Array<Heart>
				border: Array<Border>
			},
			c,
		) => {
			if (c.type === 'background') r.background.push(c)
			else if (c.type === 'border') r.border.push(c)
			else if (c.type === 'coin') r.coin.push(c)
			else if (c.type === 'heart') r.heart.push(c)
			else if (c.type === 'title') r.title.push(c)
			return r
		},
		{background: [], title: [], coin: [], heart: [], border: []},
	)

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Achievements"
			returnText="Main Menu"
			className={css.cosmeticsLayout}
		>
			<div className={css.body}>
				{/* <div className={css.updatePlayerInfo}>
					<input ref={usernameRef} placeholder={'Username'}></input>
					<Button
						onClick={() => {
							if (!usernameRef.current) return
							dispatch({
								type: localMessages.USERNAME_SET,
								name: usernameRef.current.value,
							})
						}}
					>
						Update Username
					</Button>
				</div>
				<div className={css.updatePlayerInfo}>
					<input
						ref={minecraftNameRef}
						placeholder={'Minecraft Username'}
						minLength={3}
					></input>
					<Button
						onClick={() => {
							if (!minecraftNameRef.current) return
							dispatch({
								type: localMessages.MINECRAFT_NAME_SET,
								name: minecraftNameRef.current.value,
							})
						}}
					>
						Update Player Head
					</Button>
				</div> */}
				<Tabs
					selected={tab}
					setSelected={selectTab}
					tabs={['achievements', 'rewards']}
				/>
				<div className={css.itemSelector}>
					{tab === 'achievements' && (
						<div className={css.achievements}>
							{ACHIEVEMENTS_LIST.map((achievement) => {
								return (
									<AchievementComponent
										key={achievement.numericId}
										achievement={achievement}
										progressData={progressData[achievement.numericId]}
									/>
								)
							})}
						</div>
					)}
					{tab === 'rewards' && (
						<div className={css.appearance}>
							<CosmeticPreview />
						</div>
					)}
					{tab === 'rewards' && (
						<div className={css.cosmeticsContainer}>
							<div>Backgrounds</div>
							<div className={css.cosmetics}>
								{sortedCosmetics.background.map((cosmetic) => (
									<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
								))}
							</div>
							<div>Borders</div>
							<div className={css.cosmetics}>
								{sortedCosmetics.border.map((cosmetic) => (
									<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
								))}
							</div>
							<div>Coins</div>
							<div className={css.cosmetics}>
								{sortedCosmetics.coin.map((cosmetic) => (
									<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
								))}
							</div>
							<div>Hearts</div>
							<div className={css.cosmetics}>
								{sortedCosmetics.heart.map((cosmetic) => (
									<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
								))}
							</div>
							<div>Titles</div>
							<div className={css.cosmetics}>
								{sortedCosmetics.title.map((cosmetic) => (
									<CosmeticItem cosmetic={cosmetic}></CosmeticItem>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</MenuLayout>
	)
}

export default Cosmetics
