import MarkdownIt from "markdown-it";
export interface CheckboxPluginOptions {
    divWrap: boolean;
    divClass: string;
    idPrefix: string;
    readonly: boolean;
    checkboxClass: string;
}
export declare function CheckBoxReplacer(md: MarkdownIt, userOptions: Partial<CheckboxPluginOptions>): MarkdownIt.Rule;
export declare function CheckboxPlugin(md: MarkdownIt, options: CheckboxPluginOptions): void;
