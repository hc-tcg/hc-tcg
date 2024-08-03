import {describe, expect, test} from '@jest/globals'

import {
	DifferentTextNode,
	EmojiNode,
	EmptyNode,
	FormatNode,
	ListNode,
	PlaintextNode,
	ProfanityNode,
	formatText,
} from '../../../common/utils/formatting'

describe('formatting tests', () => {
	test('text node', () => {
		expect(formatText('')).toStrictEqual(EmptyNode())
		expect(formatText('hello')).toStrictEqual(PlaintextNode('hello'))
	})

	test('different text node', () => {
		expect(formatText('{a|b}')).toStrictEqual(
			DifferentTextNode(PlaintextNode('a'), PlaintextNode('b')),
		)
		expect(formatText('left{a|b}right')).toStrictEqual(
			ListNode([
				PlaintextNode('left'),
				DifferentTextNode(PlaintextNode('a'), PlaintextNode('b')),
				PlaintextNode('right'),
			]),
		)
	})

	test('format node', () => {
		expect(formatText('$gTEST$')).toStrictEqual(
			FormatNode('good', PlaintextNode('TEST')),
		)

		// Make sure we can disable $ if wanted
		expect(formatText('$gTEST$', {'enable-$': false})).toStrictEqual(
			ListNode([PlaintextNode('$gTEST'), PlaintextNode('$')]),
		)
	})

	test('bold and italic', () => {
		expect(formatText('*hello*')).toStrictEqual(
			FormatNode('italic', PlaintextNode('hello')),
		)
		expect(formatText('**hello**')).toStrictEqual(
			FormatNode('bold', PlaintextNode('hello')),
		)
		// Note: Not testing "**" and "****" because the behavior does not matter.
		expect(formatText('***hello***')).toStrictEqual(
			FormatNode('bold', FormatNode('italic', PlaintextNode('hello'))),
		)

		expect(formatText('*hello')).toStrictEqual(PlaintextNode('*hello'))
		expect(formatText('**hello')).toStrictEqual(
			ListNode([PlaintextNode('*'), PlaintextNode('*hello')]),
		)
	})

	test('profanity node', () => {
		expect(formatText('fuck')).toStrictEqual(PlaintextNode('fuck'))
		expect(formatText('fuck', {censor: true})).toStrictEqual(
			ProfanityNode('fuck'),
		)
		expect(formatText('hello, fuck you', {censor: true})).toStrictEqual(
			ListNode([
				PlaintextNode('hello, '),
				ProfanityNode('fuck'),
				PlaintextNode(' you'),
			]),
		)
	})

	test('emoji node', () => {
		expect(formatText(':emoji:')).toStrictEqual(EmojiNode('emoji'))
		expect(formatText('left :emoji: right')).toStrictEqual(
			ListNode([
				PlaintextNode('left '),
				EmojiNode('emoji'),
				PlaintextNode(' right'),
			]),
		)
	})

	test('non-latin', () => {
		expect(formatText('こんにちは、ずんだもんだよ')).toStrictEqual(
			PlaintextNode('こんにちは、ずんだもんだよ'),
		)
		expect(formatText('こんにちは、**ずんだもんだよ**')).toStrictEqual(
			ListNode([
				PlaintextNode('こんにちは、'),
				FormatNode('bold', PlaintextNode('ずんだもんだよ')),
			]),
		)
	})

	test('escape formatting sequences', () => {
		expect(formatText('\\')).toStrictEqual(PlaintextNode('\\'))
		expect(formatText('\\*HELLO*')).toStrictEqual(
			ListNode([PlaintextNode('*HELLO'), PlaintextNode('*')]),
		)
		expect(formatText('\\*HELLO\\*')).toStrictEqual(PlaintextNode('*HELLO*'))
		expect(formatText('\\*HELLO\\*\\')).toStrictEqual(
			PlaintextNode('*HELLO*\\'),
		)
		expect(formatText('*HELLO\\*')).toStrictEqual(PlaintextNode('*HELLO*'))
	})

	test('errors do not crash code', () => {
		// The character 茶 is not a formatting code so it is expected there will be an error
		expect(formatText('$茶test$')).toStrictEqual(PlaintextNode('$茶test$'))
		// No closing $ character should not crash, even though the syntax is invalid.
		expect(formatText('$vhello')).toStrictEqual(PlaintextNode('$vhello'))
	})
})
