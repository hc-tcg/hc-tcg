import {describe, expect, test} from '@jest/globals';

import {
  formatText,
	DifferentTextNode,
	FormatNode,
	ListNode,
	FormattedTextNode,
	TextNode,
	ProfanityNode,
	EmojiNode,
} from '../../common/utils/formatting'

describe('formatting tests', () => {
  test('simple text node', () => {
    expect(formatText("hello")).toStrictEqual(new ListNode([new TextNode("hello")]));
  });
});

