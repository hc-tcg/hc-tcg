import {
	DifferentTextNode,
	FormatNode,
	ListNode,
	FormattedTextNode,
	TextNode,
	ProfanityNode,
	EmojiNode,
} from 'common/utils/formatting'

import formatCss from './formatting.module.scss'
import classNames from 'classnames'

function nodeToHtml(node: FormattedTextNode) {
	if (node.TYPE == 'ListNode') {
		let html = []

		for (let child of (node as ListNode).nodes) {
			html.push(nodeToHtml(child))
		}

		return <span> {html} </span>
	} else if (node.TYPE == 'TextNode') {
		return <span> {(node as TextNode).text} </span>
	} else if (node.TYPE == 'FormatNode') {
		const formatNode = node as FormatNode

		return (
			<span className={classNames(formatCss[formatNode.format])}>
				{nodeToHtml(formatNode.text)}
			</span>
		)
	} else if (node.TYPE == 'DifferentTextNode ') {
		let differentTextNode = node as DifferentTextNode

		return <span> {nodeToHtml(differentTextNode.playerText)}|{nodeToHtml(differentTextNode.opponentText)} </span>
	} else if (node.TYPE == 'ProfanityNode') {
		let profanityNode = node as ProfanityNode

		let contents = profanityNode.text;

		return <span> {contents} </span>
	} else if (node.TYPE == 'EmojiNode') {
		let emojiNode = node as EmojiNode
		return <span> {emojiNode.emoji} </span>
	} else if (node.TYPE == 'LineBreakNode') {
		return <br />
	} else if (node.TYPE == 'TabNode') {
		return "TAB"
	}
}

export const FormattedText = (text: FormattedTextNode | undefined) => {
	console.log(text)

	if (!text) return <div></div>

	return nodeToHtml(text)
}
