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

type Props = {
	setMenuSection: (section: string) => void
}
function Cosmetics({setMenuSection}: Props) {
	const dispatch = useDispatch()

	const [selectedCosmetic, setSelectedCosmetic] =
		useState<Cosmetic['type']>('title')
	const achievementProgress = useSelector(getAchievements)
	const appearance = useSelector(getAppearance)
	const cosmetics = ALL_COSMETICS.filter(
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
				<p>{cosmetic.name}</p>
				{isUnlocked ? (
					<></>
				) : (
					<img className={css.lockOverlay} src="/images/lock.png" />
				)}
			</div>
		)
	}

	function setCosmetic(cosmetic: Cosmetic): Appearance {
		switch (selectedCosmetic) {
			case 'title':
				return {...appearance, title: cosmetic as Title}
			case 'coin':
				return {...appearance, coin: cosmetic as Coin}
			case 'heart':
				return {...appearance, heart: cosmetic as Heart}
			case 'background':
				return {...appearance, background: cosmetic as Background}
			case 'border':
				return {...appearance, border: cosmetic as Border}
		}
	}

	return (
		<MenuLayout
			back={() => setMenuSection('achievements')}
			title="Cosmetics"
			returnText="Achievements"
			className={css.cosmeticsLayout}
		>
			<div className={css.cosmeticContainer}>
				<Dropdown
					button={<Button>Change cosmetic</Button>}
					label={'Change cosmetic'}
					showNames={true}
					options={[
						{name: 'title'},
						{name: 'coin'},
						{name: 'heart'},
						{name: 'background'},
						{name: 'border'},
					]}
					action={(action) => {
						setSelectedCosmetic(action as Cosmetic['type'])
					}}
				/>
				<div className={css.cosmeticPreview}>

				</div>
				<div className={css.itemSelector}>
					{cosmetics.map((cosmetic) => (
						<CosmeticItem cosmetic={cosmetic} />
					))}
				</div>
			</div>
			
		</MenuLayout>
	)
}

export default Cosmetics
