import css from './link-container.module.css'
import {useSelector} from 'react-redux'
import {getStats} from 'logic/fbdb/fbdb-selectors'

function LinkContainer() {
	const stats = useSelector(getStats)
	const resetStats = () => {
		global.dbObj.dbref.set({w: 0, l: 0, fw: 0, fl: 0})
	}
	return (
		<>
			<div className={css.linkContainer}>
				<a
					href="https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/"
					target="_blank"
					rel="noreferrer"
					title="Reddit"
				>
					<img src="/images/icons/reddit.svg" height="26" />
				</a>
				<a
					href="https://github.com/martinkadlec0/hc-tcg"
					target="_blank"
					rel="noreferrer"
					title="Github"
				>
					<img src="/images/icons/github.svg" height="26" />
				</a>

				<a
					href="https://discord.gg/AjGbqNfcQX"
					target="_blank"
					rel="noreferrer"
					title="Discord"
				>
					<img src="/images/icons/discord.svg" height="26" />
				</a>
			</div>
			<div className={css.linkContainer}>
				<a>
					W-L: {stats.w}-{stats.l}
				</a>
				<button onClick={resetStats}>Reset Stats?</button>
			</div>
		</>
	)
}

export default LinkContainer
