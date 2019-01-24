// based on https://github.com/mcecot/markdown-it-checkbox

import MarkdownIt from "markdown-it";
import Token from 'markdown-it/lib/token';
import StateCore from "markdown-it/lib/rules_core/state_core";

export interface CheckboxPluginOptions {
	divWrap: boolean;
	divClass: string;
	idPrefix: string;
	readonly: boolean;
	checkboxClass: string;
}

interface TokenConstructor {
	new(name: string, tagName: string, someNumber: number): Token;
}

interface CheckboxReplacerState extends StateCore {
	Token: TokenConstructor;
}

export function CheckBoxReplacer(md: MarkdownIt, userOptions: Partial<CheckboxPluginOptions>): MarkdownIt.Rule {
	let lastId = 0;
	const defaults: CheckboxPluginOptions = {
		divWrap: false,
		divClass: 'checkbox',
		idPrefix: 'checkbox',
		readonly: true,
		checkboxClass: ''
	};
	const options = $.extend(defaults, userOptions);
	const pattern = /\[(X|\s|\_|\-)\]\s(.*)/i;
	const createTokens = function (checked: boolean, label: string, Token: TokenConstructor, line: number): Token[] {
		const nodes: Token[] = [];
		let token: Token;

		/**
		 * <div class="checkbox">
		 */
		if (options.divWrap) {
			token = new Token("checkbox_open", "div", 1);
			token.attrs = [["class", options.divClass]];
			nodes.push(token);
		}

		/**
		 * <input type="checkbox" id="checkbox{n}" checked="true data-line="{n}">
		 */
		const id = options.idPrefix + lastId;
		lastId += 1;
		token = new Token("checkbox_input", "input", 0);
		token.attrs = [["type", "checkbox"], ["id", id]];
		if (checked === true) {
			token.attrs.push(["checked", "true"]);
		}
		if (options.readonly) {
			token.attrs.push(["disabled", "disabled"]);
		}
		if (options.checkboxClass) {
			token.attrs.push(["class", options.checkboxClass]);
		}
		token.attrs.push(["data-line", String(line)]);
		nodes.push(token);

		/**
		 * <label for="checkbox{n}">
		 */
		token = new Token("label_open", "label", 1);
		token.attrs = [["for", id]];
		nodes.push(token);

		/**
		 * content of label tag
		 */
		token = new Token("text", "", 0);
		token.content = label;
		nodes.push(token);

		/**
		 * closing tags
		 */
		nodes.push(new Token("label_close", "label", -1));
		if (options.divWrap) {
			nodes.push(new Token("checkbox_close", "div", -1));
		}
		return nodes;
	};

	const splitTextToken = function (original: Token, Token: TokenConstructor, line: number): Token[] {
		const text = original.content;
		const matches = text.match(pattern);
		if (matches === null) {
			return [original];
		}
		const value = matches[1];
		const label = matches[2];
		const checked = (value === "X" || value === "x");
		return createTokens(checked, label, Token, line);
	};

	return function (state: CheckboxReplacerState) {
		for (const token of state.tokens) {
			if (token.type === "inline") {
				let currentLine = token.map ? token.map[0] : 0;
				let newChildren: Token[] = [];
				for (const childToken of token.children) {
					if (childToken.type === 'hardbreak' || childToken.type === 'softbreak') {
						currentLine++;
					}
					newChildren = newChildren.concat(splitTextToken(childToken, state.Token, currentLine))
				}
				token.children = newChildren;
			}
		}
	};
}

export function CheckboxPlugin(md: MarkdownIt, options: CheckboxPluginOptions) {
	md.core.ruler.push("checkbox", CheckBoxReplacer(md, options));
}
