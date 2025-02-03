import MenuLayout from 'components/menu-layout'
import {
	getAchievements,
	getAppearance,
} from 'logic/game/database/database-selectors'
import {useDispatch, useSelector} from 'react-redux'
import css from './cosmsetics.module.scss'
import {useState} from 'react'
import {
	Appearance,
	Background,
	Border,
	Coin,
	Cosmetic,
	Heart,
	Title,
} from 'common/cosmetics/types'
import {ALL_COSMETICS} from 'common/cosmetics'
import {ACHIEVEMENTS} from 'common/achievements'
import cn from 'classnames'
import Button from 'components/button'
import {localMessages} from 'logic/messages'
import Dropdown from 'components/dropdown'
import {getSession} from 'logic/session/session-selectors'

type Props = {
	setMenuSection: (section: string) => void
}
function Cosmetics({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const {playerName, minecraftName} = useSelector(getSession)

	const [selectedCosmetic, setSelectedCosmetic] =
		useState<Cosmetic['type']>('title')
	const achievementProgress = useSelector(getAchievements)
	const appearance = useSelector(getAppearance)
	const slectableCosmetics = ALL_COSMETICS.filter(
		(cosmetic) => cosmetic.type === selectedCosmetic,
	)
	const selected = appearance[selectedCosmetic]

	const CosmeticItem = ({cosmetic}: {cosmetic: Cosmetic}) => {
		let isUnlocked = true
		if (cosmetic.requires && ACHIEVEMENTS[cosmetic.requires]) {
			const achievement = ACHIEVEMENTS[cosmetic.requires]
			isUnlocked = !!achievementProgress[achievement.numericId]?.completionTime
		}
		let isSelected = selected.id === cosmetic.id
		return (
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
				{cosmetic.name}
				{isUnlocked ? (
					<></>
				) : (
					<img className={css.lockOverlay} src="/images/lock.png" />
				)}
			</div>
		)
	}

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
		<MenuLayout
			back={() => setMenuSection('achievements')}
			title="Cosmetics"
			returnText="Achievements"
			className={css.cosmeticsLayout}
		>
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
			<div className={css.itemSelector}>
				<Dropdown
					button={
						<Button>
							{selectedCosmetic.charAt(0).toUpperCase() +
								selectedCosmetic.slice(1) +
								's'}
						</Button>
					}
					label={'Change cosmetic'}
					showNames={true}
					options={[
						{name: 'Titles', key: 'title'},
						{name: 'Coins', key: 'coin'},
						{name: 'Hearts', key: 'heart'},
						{name: 'Backgrounds', key: 'background'},
						{name: 'Borders', key: 'border'},
					]}
					action={(action) => {
						setSelectedCosmetic(action as Cosmetic['type'])
					}}
				/>
				<div className={css.cosmetics}>
					{slectableCosmetics.map((cosmetic) => (
						<CosmeticItem cosmetic={cosmetic} />
					))}
				</div>
			</div>
		</MenuLayout>
	)
}

export default Cosmetics
