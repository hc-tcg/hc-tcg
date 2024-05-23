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

function nodeToHtml(node: FormattedTextNode, opponent: boolean) {
	if (node.TYPE == 'ListNode') {
		let html = []

		for (let child of (node as ListNode).nodes) {
			html.push(nodeToHtml(child, opponent))
		}
		return <span>{html}</span>
	} else if (node.TYPE == 'TextNode') {
		return <span>{(node as TextNode).text}</span>
	} else if (node.TYPE == 'FormatNode') {
		const formatNode = node as FormatNode

		return (
			<span className={classNames(css[formatNode.format], opponent ? css.viewedByOpponent : '')}>
				{nodeToHtml(formatNode.text, opponent)}
			</span>
		)
	} else if (node.TYPE == 'DifferentTextNode') {
		let differentTextNode = node as DifferentTextNode

		return (
			<span>
				{opponent
					? nodeToHtml(differentTextNode.opponentText, opponent)
					: nodeToHtml(differentTextNode.playerText, opponent)}
			</span>
		)
	} else if (node.TYPE == 'ProfanityNode') {
		let profanityNode = node as ProfanityNode

		let contents = profanityNode.text

		return <span>{contents}</span>
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

export const FormattedText = (text: FormattedTextNode | undefined, opponent?: boolean) => {
	if (!text) return <span />

	return nodeToHtml(text, opponent ? opponent : false)
}
