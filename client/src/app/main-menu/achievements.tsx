import {ACHIEVEMENTS_LIST} from 'common/achievements'
import AchievementComponent from 'components/achievement'
import Button from 'components/button'
import MenuLayout from 'components/menu-layout'
import {getAchievements} from 'logic/game/database/database-selectors'
import {useSelector} from 'react-redux'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}
function Achievements({setMenuSection}: Props) {
	const data = useSelector(getAchievements)

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Achievements"
			returnText="Main menu"
			className={css.settingsMenu}
		>
			<h2>Achievements</h2>
			<Button onClick={() => setMenuSection('cosmetics')}>Cosmetics</Button>
			<div className={css.achievementsContainer}>
				{ACHIEVEMENTS_LIST.map((achievement) => (
					<AchievementComponent
						key={achievement.numericId}
						achievement={achievement}
						progressData={data[achievement.numericId]}
					/>
				))}
			</div>
		</MenuLayout>
	)
}

export default Achievements
