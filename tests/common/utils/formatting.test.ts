import { describe, expect, test } from '@jest/globals'

import {
	formatText,
	DifferentTextNode,
	FormatNode,
	ListNode,
	TextNode,
	ProfanityNode,
	EmojiNode,
	EmptyNode,
} from '../../../common/utils/formatting'

describe('formatting tests', () => {
	test('text node', () => {
		expect(formatText('')).toStrictEqual(new EmptyNode())
		expect(formatText('hello')).toStrictEqual(new TextNode('hello'))
	})

	test('different text node', () => {
		expect(formatText('{a|b}')).toStrictEqual(
			new DifferentTextNode(new TextNode('a'), new TextNode('b'))
		)
		expect(formatText('left{a|b}right')).toStrictEqual(
			new ListNode([
				new TextNode('left'),
				new DifferentTextNode(new TextNode('a'), new TextNode('b')),
				new TextNode('right'),
			])
		)
	})

	test('format node', () => {
		expect(formatText('$gTEST$')).toStrictEqual(new FormatNode('good', new TextNode('TEST')))

		// Make sure we can disable $ if wanted
		expect(formatText('$gTEST$', { 'enable-$': false })).toStrictEqual(
			new ListNode([new TextNode('$gTEST'), new TextNode('$')])
		)
	})

	test('bold and italic', () => {
		expect(formatText('*hello*')).toStrictEqual(new FormatNode('italic', new TextNode('hello')))
		expect(formatText('**hello**')).toStrictEqual(new FormatNode('bold', new TextNode('hello')))
		// Note: Not testing "**" and "****" because the behavior does not matter.
		expect(formatText('***hello***')).toStrictEqual(
			new FormatNode('bold', new FormatNode('italic', new TextNode('hello')))
		)

		expect(formatText('*hello')).toStrictEqual(new TextNode('*hello'))
		expect(formatText('**hello')).toStrictEqual(new ListNode([new TextNode("*"), new TextNode('*hello')]))
	})

	test('profanity node', () => {
		expect(formatText('fuck')).toStrictEqual(new TextNode('fuck'))
		expect(formatText('fuck', { censor: true })).toStrictEqual(new ProfanityNode('fuck'))
		expect(formatText('hello, fuck you', { censor: true })).toStrictEqual(
			new ListNode([new TextNode('hello, '), new ProfanityNode('fuck'), new TextNode(' you')])
		)
	})

	test('emoji node', () => {
		expect(formatText(':emoji:')).toStrictEqual(new EmojiNode('emoji'))
		expect(formatText('left :emoji: right')).toStrictEqual(
			new ListNode([new TextNode('left '), new EmojiNode('emoji'), new TextNode(' right')])
		)
	})

	test('non-latin', () => {
		expect(formatText("こんにちは、ずんだもんだよ")).toStrictEqual(new TextNode("こんにちは、ずんだもんだよ"))
		expect(formatText("こんにちは、**ずんだもんだよ**")).toStrictEqual(new ListNode([new TextNode("こんにちは、"), new FormatNode('bold', new TextNode("ずんだもんだよ"))]))
	})

	test('escape formatting sequences', () => {
		expect(formatText("\\")).toStrictEqual(new TextNode("\\"))
		expect(formatText("\\*HELLO*")).toStrictEqual(new ListNode([new TextNode("*HELLO"), new TextNode("*")]))
		expect(formatText("\\*HELLO\\*")).toStrictEqual(new TextNode("*HELLO*"))
		expect(formatText("\\*HELLO\\*\\")).toStrictEqual(new TextNode("*HELLO*\\"))
		expect(formatText("*HELLO\\*")).toStrictEqual(new TextNode("*HELLO*"))
	})
	
	test('errors do not crash code', () => {
		// The character 茶 is not a formatting code so it is expected there will be an error
		expect(formatText("$茶test$")).toStrictEqual(new TextNode("$茶test$"))
		// No closing $ character should not crash, even though the syntax is invalid.
		expect(formatText("$vhello")).toStrictEqual(new TextNode("$vhello"))
	})
})
