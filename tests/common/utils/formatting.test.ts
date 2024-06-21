import {describe, expect, test} from '@jest/globals'

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
		expect(formatText('')).toStrictEqual(EmptyNode())
		expect(formatText('hello')).toStrictEqual(TextNode('hello'))
	})

	test('different text node', () => {
		expect(formatText('{a|b}')).toStrictEqual(DifferentTextNode(TextNode('a'), TextNode('b')))
		expect(formatText('left{a|b}right')).toStrictEqual(
			ListNode([
				TextNode('left'),
				DifferentTextNode(TextNode('a'), TextNode('b')),
				TextNode('right'),
			])
		)
	})

	test('format node', () => {
		expect(formatText('$gTEST$')).toStrictEqual(FormatNode('good', TextNode('TEST')))

		// Make sure we can disable $ if wanted
		expect(formatText('$gTEST$', {'enable-$': false})).toStrictEqual(
			ListNode([TextNode('$gTEST'), TextNode('$')])
		)
	})

	test('bold and italic', () => {
		expect(formatText('*hello*')).toStrictEqual(FormatNode('italic', TextNode('hello')))
		expect(formatText('**hello**')).toStrictEqual(FormatNode('bold', TextNode('hello')))
		// Note: Not testing "**" and "****" because the behavior does not matter.
		expect(formatText('***hello***')).toStrictEqual(
			FormatNode('bold', FormatNode('italic', TextNode('hello')))
		)

		expect(formatText('*hello')).toStrictEqual(TextNode('*hello'))
		expect(formatText('**hello')).toStrictEqual(ListNode([TextNode('*'), TextNode('*hello')]))
	})

	test('profanity node', () => {
		expect(formatText('fuck')).toStrictEqual(TextNode('fuck'))
		expect(formatText('fuck', {censor: true})).toStrictEqual(ProfanityNode('fuck'))
		expect(formatText('hello, fuck you', {censor: true})).toStrictEqual(
			ListNode([TextNode('hello, '), ProfanityNode('fuck'), TextNode(' you')])
		)
	})

	test('emoji node', () => {
		expect(formatText(':emoji:')).toStrictEqual(EmojiNode('emoji'))
		expect(formatText('left :emoji: right')).toStrictEqual(
			ListNode([TextNode('left '), EmojiNode('emoji'), TextNode(' right')])
		)
	})

	test('non-latin', () => {
		expect(formatText('こんにちは、ずんだもんだよ')).toStrictEqual(
			TextNode('こんにちは、ずんだもんだよ')
		)
		expect(formatText('こんにちは、**ずんだもんだよ**')).toStrictEqual(
			ListNode([TextNode('こんにちは、'), FormatNode('bold', TextNode('ずんだもんだよ'))])
		)
	})

	test('escape formatting sequences', () => {
		expect(formatText('\\')).toStrictEqual(TextNode('\\'))
		expect(formatText('\\*HELLO*')).toStrictEqual(ListNode([TextNode('*HELLO'), TextNode('*')]))
		expect(formatText('\\*HELLO\\*')).toStrictEqual(TextNode('*HELLO*'))
		expect(formatText('\\*HELLO\\*\\')).toStrictEqual(TextNode('*HELLO*\\'))
		expect(formatText('*HELLO\\*')).toStrictEqual(TextNode('*HELLO*'))
	})

	test('errors do not crash code', () => {
		// The character 茶 is not a formatting code so it is expected there will be an error
		expect(formatText('$茶test$')).toStrictEqual(TextNode('$茶test$'))
		// No closing $ character should not crash, even though the syntax is invalid.
		expect(formatText('$vhello')).toStrictEqual(TextNode('$vhello'))
	})
})
