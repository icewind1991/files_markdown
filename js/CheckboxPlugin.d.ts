/// <reference types="markdown-it" />
import * as MarkdownIt from "markdown-it";
export interface CheckboxPluginOptions {
    divWrap: boolean;
    divClass: string;
    idPrefix: string;
    readonly: boolean;
    checkboxClass: string;
}
export declare function CheckBoxReplacer(md: MarkdownIt.MarkdownIt, userOptions: Partial<CheckboxPluginOptions>): MarkdownIt.Rule;
export declare function CheckboxPlugin(md: MarkdownIt.MarkdownIt, options: CheckboxPluginOptions): void;
