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
			<div className={css.creditsContainer}>
				<Credit
					name="Minion Harou"
					handle="minionharou"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/171689337954500608/c17287ea15fbbbf66f8bfcbcdf6bd705.webp"
				/>
				<Credit
					name="ImagineFyre"
					handle="imaginefyre"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/395760322864218113/89d3e188881c3aacd62a91c8f6b0b2f5.webp"
				/>
				<Credit
					name="Benji"
					handle="alicetouhou"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/63879236?v=4"
				/>
				<Credit
					name="ChimeraDev"
					handle="chimeradev"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/109681545?v=4"
				/>
				<Credit
					name="Niko"
					handle="niko.uy"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/12455733?v=4"
				/>
				<Credit
					name="ProfNinja"
					handle="profninja"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/671639?v=4"
				/>
				<Credit
					name="Scopop"
					handle="scopop"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/625061304939446273/6ec5d4462e4d4a0e4833ed908dbd9c2f.webp"
				/>
				<Credit
					name="Sense_101"
					handle="sense101"
					social="discord"
					avatar="https://avatars.githubusercontent.com/u/67970865?v=4"
				/>
				<Credit
					name="Tyrannicodin"
					handle="tyrannicodin"
					social="discord"
					avatar="https://cdn.discordapp.com/avatars/547104418131083285/0e6fa62e2f647943f21ecbe2d21a9291.webp"
				/>
			</div>
		</MenuLayout>
	)
}

export default Credits
