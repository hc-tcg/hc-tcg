import {
	DifferentTextNode,
	FormatNode,
	ListNode,
	FormattedTextNode,
	TextNode,
	ProfanityNode,
	EmojiNode,
	EmptyNode,
	LineBreakNode,
	TabNode,
	LineNode,
} from 'common/utils/formatting'

import css from './formatting.module.scss'
import classNames from 'classnames'

type DisplaySettings = {
	isOpponent?: boolean
	censorProfanity?: boolean
}

function nodeToHtml(node: FormattedTextNode, settings: DisplaySettings) {
	if (node instanceof ListNode) {
		let html = []

		for (let child of node.nodes) {
			html.push(nodeToHtml(child, settings))
		}
		return <span>{html}</span>
	} else if (node instanceof EmptyNode) {
		return <div />
	} else if (node instanceof TextNode) {
		return <span>{node.text}</span>
	} else if (node instanceof FormatNode) {
		return (
			<span
				className={classNames(css[node.format], settings.isOpponent ? css.viewedByOpponent : '')}
			>
				{nodeToHtml(node.text, settings)}
			</span>
		)
	} else if (node instanceof DifferentTextNode) {
		return (
			<span>
				{settings.isOpponent
					? nodeToHtml(node.opponentText, settings)
					: nodeToHtml(node.playerText, settings)}
			</span>
		)
	} else if (node instanceof ProfanityNode) {
		if (settings.censorProfanity) {
			return <span> {node.censor()} </span>
		}
		return <span>{node.text}</span>
	} else if (node instanceof EmojiNode) {
		const link = `/images/hermits-emoji/${node.emoji.toLowerCase()}.png`
		const alt = `:${node.emoji}:`

		return <img className={css.emoji} src={link} alt={alt} />
	} else if (node instanceof LineBreakNode) {
		return <br />
	} else if (node instanceof TabNode) {
		return <span className={css.tab}></span>
	} else if (node instanceof LineNode) {
		return <span className={css.line} />
	}
}

export const FormattedText = (text: FormattedTextNode | undefined, settings?: DisplaySettings) => {
	settings = settings || {}
	if (!text) return <span />

	return nodeToHtml(text, settings)
}
