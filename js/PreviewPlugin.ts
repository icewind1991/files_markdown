import {Renderer} from './Renderer';
import {UnderscoreStatic} from "underscore";

declare const _: UnderscoreStatic;

export class PreviewPlugin {
    renderer: Renderer;

    initPromise: JQueryPromise<void> | null = null;

    init() {
        if (!this.initPromise) {
            const deferred = $.Deferred();
            require.ensure(['./Renderer'], () => {
                const {Renderer} = require('./Renderer');
                this.renderer = new Renderer();
                deferred.resolve();
            });
            this.initPromise = deferred.promise();
        }
        return this.initPromise;
    }

    preview = _.throttle((text: string, element) => {
        this.renderer.renderText(text, element);
    }, 500);
}