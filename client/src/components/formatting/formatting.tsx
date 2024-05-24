import {
	DifferentTextNode,
	FormatNode,
	ListNode,
	FormattedTextNode,
	TextNode,
	ProfanityNode,
	EmojiNode,
} from 'common/utils/formatting'

import css from './formatting.module.scss'
import classNames from 'classnames'

type DisplaySettings = {
	'isOpponent'?: boolean,
	'censorProfanity'?: boolean,
}

function nodeToHtml(node: FormattedTextNode, settings: DisplaySettings) {
	if (node.TYPE == 'ListNode') {
		let html = []

		for (let child of (node as ListNode).nodes) {
			html.push(nodeToHtml(child, settings))
		}
		return <span>{html}</span>
	} else if (node.TYPE == 'EmptyNode') {
		return <div/>
	} else if (node.TYPE == 'TextNode') {
		return <span>{(node as TextNode).text}</span>
	} else if (node.TYPE == 'FormatNode') {
		const formatNode = node as FormatNode

		return (
			<span className={classNames(css[formatNode.format], settings.isOpponent ? css.viewedByOpponent : '')}>
				{nodeToHtml(formatNode.text, settings)}
			</span>
		)
	} else if (node.TYPE == 'DifferentTextNode') {
		let differentTextNode = node as DifferentTextNode

		return (
			<span>
				{settings.isOpponent
					? nodeToHtml(differentTextNode.opponentText, settings)
					: nodeToHtml(differentTextNode.playerText, settings)}
			</span>
		)
	} else if (node.TYPE == 'ProfanityNode') {
		let profanityNode = node as ProfanityNode

		if (settings.censorProfanity) {
			return <span> {profanityNode.censor()} </span>
		}
		return <span>{profanityNode.text}</span>
	} else if (node.TYPE == 'EmojiNode') {
		const emojiNode = node as EmojiNode

		const link = `/images/hermits-emoji/${emojiNode.emoji.toLowerCase()}.png`;
		const alt = `:${emojiNode.emoji}:`

		return <img className={css.emoji} src={link} alt={alt} />
	} else if (node.TYPE == 'LineBreakNode') {
		return <br />
	} else if (node.TYPE == 'TabNode') {
		return <span className={css.tab}></span>
	} else if (node.TYPE == 'LineNode') {
		return <span className={css.line} />
	}
}

export const FormattedText = (text: FormattedTextNode | undefined, settings?: DisplaySettings) => {
	settings = settings || {}
	if (!text) return <span />

	return nodeToHtml(text, settings)
}
