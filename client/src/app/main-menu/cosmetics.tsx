import MenuLayout from 'components/menu-layout'
import {getAchievements} from 'logic/game/database/database-selectors'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'
import {useState} from 'react'
import {Cosmetic} from 'common/cosmetics/types'
import {ALL_COSMETICS} from 'common/cosmetics'
import { ACHIEVEMENTS } from 'common/achievements'
import cn from 'classnames'

type Props = {
	setMenuSection: (section: string) => void
}
function Cosmetics({setMenuSection}: Props) {
	const [selectedCosmetic, setSelectedCosmetic] =
		useState<Cosmetic['type']>('title')
    const achievementProgress = useSelector(getAchievements)
    console.log(achievementProgress)
	const cosmetics = ALL_COSMETICS.filter(
		(cosmetic) => cosmetic.type === selectedCosmetic,
	)

    const CosmeticItem = ({cosmetic}: {cosmetic: Cosmetic}) => {
        let unlocked = true
        if (cosmetic.requires && ACHIEVEMENTS[cosmetic.requires]) {
            const achievement = ACHIEVEMENTS[cosmetic.requires]
            unlocked = !!achievementProgress[achievement.numericId].completionTime
        }
        return (
            <div className={cn(css.cosmeticItem, {[css.unlocked]: unlocked})}>
                <p>{cosmetic.name}</p>
                {unlocked ? <></> : <img className={css.lockOverlay} src='/images/lock.png'/>}
            </div>
        )
    }

	return (
		<MenuLayout
			back={() => setMenuSection('achievements')}
			title="Cosmetics"
			returnText="Achievements"
			className={css.cosmeticsLayout}
		>
			<h2>Cosmetics</h2>
			<div className={css.itemSelector}>{cosmetics.map(cosmetic => 
                <CosmeticItem cosmetic={cosmetic} />
            )}</div>
		</MenuLayout>
	)
}

export default Cosmetics
