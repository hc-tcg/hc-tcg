import { CurlyBracketNode, FormatNode, ListNode, Node, TextNode } from "common/utils/formatting";

function nodeToHtml(node: Node) {
  if (node instanceof ListNode) {
    let html = []

    for (let child of node.nodes) {
      html.push(nodeToHtml(child))
    }

    return <span> {html} </span>
  }
  else if (node instanceof TextNode) {
    <span> {node.text} </span>

  }
  else if (node instanceof FormatNode) {
    return nodeToHtml(node.text)
  }
  else if (node instanceof CurlyBracketNode) {
    <span> "Curly Bracket Node" </span>
  }
}


const FormattedText = (text: Node) => {
  return nodeToHtml(text)
}


