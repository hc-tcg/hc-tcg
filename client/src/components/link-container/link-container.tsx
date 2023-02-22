import css from './link-container.module.css'

function LinkContainer() {
	return (
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
	)
}

export default LinkContainer
