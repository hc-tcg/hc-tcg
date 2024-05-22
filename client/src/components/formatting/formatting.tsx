import {
	CurlyBracketNode,
	FormatNode,
	ListNode,
	FormattedTextNode,
	TextNode,
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
	} else if (node.TYPE == 'CurlyBracketNode') {
		let curlyBracketNode = node as CurlyBracketNode

		return <span> "Curly Bracket Node" </span>
	}
}

export const FormattedText = (text: FormattedTextNode | undefined) => {
	console.log(text)

	if (!text) return <div></div>

	return nodeToHtml(text)
}
