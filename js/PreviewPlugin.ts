import {Renderer} from './Renderer';
import {UnderscoreStatic} from "underscore";

declare const _: UnderscoreStatic;

type onPopstate = (this: Window, ev: PopStateEvent) => any;

export class PreviewPlugin {
    private renderer: Renderer;

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
            const onHashChange = window.onpopstate;
            if (!this.textEditorOnHashChange) {
                this.textEditorOnHashChange = window.onpopstate;
            }
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
        this.renderer.renderText(text, element);
    }, 500);
}