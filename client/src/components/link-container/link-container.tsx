import css from './link-container.module.css'

function LinkContainer() {
	return (
		<div className={`${css.linkContainer} temp`}>
			<a
				href="https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/"
				target="_blank"
				rel="noreferrer"
				title="Reddit"
			>
				<img draggable={false} src="/images/icons/reddit.svg" />
			</a>
			<a
				href="https://github.com/martinkadlec0/hc-tcg"
				target="_blank"
				rel="noreferrer"
				title="Github"
			>
				<img draggable={false} src="/images/icons/github.svg" />
			</a>

			<a
				href="https://discord.gg/AjGbqNfcQX"
				target="_blank"
				rel="noreferrer"
				title="Discord"
			>
				<img draggable={false} src="/images/icons/discord.svg" />
			</a>
		</div>
	)
}

export default LinkContainer
