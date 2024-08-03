import classNames from 'classnames'
import {FormattedTextNode, censorProfanityNode} from 'common/utils/formatting'
import css from './formatting.module.scss'

type DisplaySettings = {
	isSelectable?: boolean
	isOpponent?: boolean
	censorProfanity?: boolean
}

function nodeToHtml(node: FormattedTextNode, settings: DisplaySettings) {
	let textCssClasses = []

	if (settings.isSelectable != false) {
		textCssClasses.push(css['selectable'])
	}

	switch (node.TYPE) {
		case 'ListNode':
			let html = []

			for (let child of node.nodes) {
				html.push(nodeToHtml(child, settings))
			}
			return <span>{html}</span>
		case 'EmptyNode':
			return <span />
		case 'PlaintextNode':
			return <span className={classNames(...textCssClasses)}>{node.text}</span>
		case 'FormatNode':
			return (
				<span
					className={classNames(
						css[node.format],
						settings.isOpponent ? css.viewedByOpponent : '',
						...textCssClasses,
					)}
				>
					{nodeToHtml(node.text, settings)}
				</span>
			)
		case 'DifferentTextNode':
			return (
				<span className={classNames(...textCssClasses)}>
					{settings.isOpponent
						? nodeToHtml(node.opponentText, settings)
						: nodeToHtml(node.playerText, settings)}
				</span>
			)
		case 'ProfanityNode':
			if (settings.censorProfanity) {
				return (
					<span className={classNames(...textCssClasses)}>
						{' '}
						{censorProfanityNode(node)}{' '}
					</span>
				)
			}
			return <span className={classNames(...textCssClasses)}>{node.text}</span>
		case 'EmojiNode':
			const link = `/images/hermits-emoji/${node.emoji.toLowerCase()}.png`
			const alt = `:${node.emoji}:`

			return (
				<img
					className={classNames(css.emoji, ...textCssClasses)}
					src={link}
					alt={alt}
				/>
			)
		case 'LineBreakNode':
			return <br />
		case 'TabNode':
			return <span className={css.tab}></span>
		case 'LineNode':
			return <span className={css.line} />
	}
}

export const FormattedText = (
	text: FormattedTextNode | undefined,
	settings?: DisplaySettings,
) => {
	settings = settings || {}
	if (!text) return <span />

	return nodeToHtml(text, settings)
}
