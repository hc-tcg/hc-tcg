import css from './main-menu.module.scss'
import MenuLayout from 'components/menu-layout'
import Credit from 'components/credit'

type Props = {
	setMenuSection: (section: string) => void
}
function Credits({setMenuSection}: Props) {
	return (
		<MenuLayout
			back={() => setMenuSection('settings')}
			title="Credits"
			returnText="Settings"
			className={css.settingsMenu}
		>
			<h2>Game Designers</h2>
			<div className={css.creditsContainer}>
				<Credit
					name="VintageBeef - Game Creator"
					handle="@VintageBeefLP"
					social="twitter"
					link="https://twitter.com/VintageBeefLP"
					avatar="https://pbs.twimg.com/profile_images/1382001684151332867/iYD2Xj7c_400x400.jpg"
				/>
				<Credit
					name="Hoffen - Artist"
					handle="@_inkGhoul"
					social="twitter"
					link="https://twitter.com/_InkGhoul"
					avatar="https://pbs.twimg.com/profile_images/1649526891374841856/6nwnDz20_400x400.jpg"
				/>
			</div>
			<h2>Website Developers</h2>
			{/* <div className={css.creditsContainer}>
				<Credit
					name="Benji"
					handle="alicetouhou"
					social="discord"
					avatar="https://pbs.twimg.com/profile_images/1382001684151332867/iYD2Xj7c_400x400.jpg"
				/>
			</div> */}
		</MenuLayout>
	)
}

export default Credits
