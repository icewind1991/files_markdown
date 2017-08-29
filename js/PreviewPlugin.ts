import {Renderer} from './Renderer';
import {UnderscoreStatic} from "underscore";

declare const _: UnderscoreStatic;

declare const aceEditor: AceAjax.Editor;

type onPopstate = (this: Window, ev: PopStateEvent) => any;

export class PreviewPlugin {
    private renderer: Renderer;
    private Range: new (startRow: number, startColumn: number, endRow: number, endColumn: number) => AceAjax.Range;

    private initPromise: JQueryPromise<void> | null = null;
    private textEditorOnHashChange: onPopstate | null;

    init() {
        if (!this.initPromise) {
            const deferred = $.Deferred();
            require.ensure(['./Renderer'], () => {
                const {Renderer} = require('./Renderer');
                this.renderer = new Renderer();
                deferred.resolve();
            });
            this.initPromise = deferred.promise();
            if (!this.textEditorOnHashChange) {
                this.textEditorOnHashChange = window.onpopstate;
            }

            this.Range = window['ace'].require("ace/range").Range;

            aceEditor.$blockScrolling = Infinity;
        }

        return this.initPromise;
    }

    onHashChange(e: PopStateEvent) {
        const hash = window.location.hash.substr(1);
        if (hash.substr(0, 6) !== 'editor' && this.textEditorOnHashChange) {
            this.textEditorOnHashChange.call(window, e)
        }
    }

    preview = _.throttle((text: string, element) => {
        window.onpopstate = this.onHashChange;
        const Range = this.Range;
        this.renderer.renderText(text, element).then(() => {
            element.find('input[type=checkbox]').change(function () {
                const checked = this.checked;
                const row = this.dataset.line;
                const session = aceEditor.getSession();
                const oldText = session.getLine(row);
                const newText = checked ?
                    oldText.replace('[ ]', '[x]') :
                    oldText.replace(/\[(x|X)\]/, '[ ]');
                session.replace(new Range(row, 0, row, Number.MAX_VALUE), newText);
            });
        });
    }, 500);
}