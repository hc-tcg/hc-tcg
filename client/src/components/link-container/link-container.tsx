import {VERSION} from '../../../../common/config'
import css from './link-container.module.scss'

export function VersionLinks() {
	return (
		<p className={css.version}>
			<span>v{VERSION} - </span>
			<a
				href="https://www.reddit.com/r/HermitCraft/comments/10wksaw/hctcg_online/"
				target="_blank"
				rel="noreferrer"
				title="Reddit"
			>
				<img draggable={false} src="/images/icons/reddit.svg" />
				Reddit
			</a>
			<a
				href="https://github.com/martinkadlec0/hc-tcg"
				target="_blank"
				rel="noreferrer"
				title="Github"
			>
				<img draggable={false} src="/images/icons/github.svg" />
				GitHub
			</a>
			<a
				href="https://discord.gg/AjGbqNfcQX"
				target="_blank"
				rel="noreferrer"
				title="Discord"
			>
				<img draggable={false} src="/images/icons/discord.svg" />
				Discord
			</a>
		</p>
	)
}

function LinkContainer() {
	return (
		<div className={css.linkContainer}>
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
