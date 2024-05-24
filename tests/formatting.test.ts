import { describe, expect, test } from '@jest/globals';

import {
  formatText,
  DifferentTextNode,
  FormatNode,
  ListNode,
  FormattedTextNode,
  TextNode,
  ProfanityNode,
  EmojiNode,
} from '../common/utils/formatting'

describe('formatting tests', () => {
  test('text node', () => {
    expect(formatText("hello")).toStrictEqual(new TextNode("hello"));
  });

  test('format node', () => {
    expect(formatText("$gTEST$")).toStrictEqual(new FormatNode(["good"], new TextNode("TEST")))

    // Make sure we can disable $ is wanted
    expect(formatText("$gTEST$", {"enable-$": false})).toStrictEqual(new ListNode([new TextNode("$gTEST"), new TextNode("$")]));
    
  });

  test('different text node', () => {
    expect(formatText("{a|b}")).toStrictEqual(new DifferentTextNode(new TextNode("a"), new TextNode("b")));
    expect(formatText("left{a|b}right")).toStrictEqual(new ListNode([new TextNode("left"), new DifferentTextNode(new TextNode("a"), new TextNode("b")), new TextNode("right")]));
  });
});
