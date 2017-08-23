import {Renderer} from './Renderer';
import {UnderscoreStatic} from "underscore";

declare const _: UnderscoreStatic;

export class PreviewPlugin {
    renderer: Renderer = new Renderer();

    init() {

    }

    preview = _.throttle(this.renderer.renderText.bind(this.renderer), 500);
}