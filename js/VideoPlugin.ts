// based on https://github.com/brianjgeiger/markdown-it-video

import MarkdownIt from "markdown-it";
import Token from 'markdown-it/lib/token';

type VideoService = 'youtube' | 'vimeo' | 'vine' | 'prezi';

function isVideoService(service: string): service is VideoService {
    return ['youtube', 'vimeo', 'vine', 'prezi'].indexOf(service) !== -1;
}

const youtubeRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

function youtubeParser(url: string): string {
    const match = url.match(youtubeRegex);
    return match && match[7].length === 11 ? match[7] : url;
}

/*eslint-disable max-len */
const vimeoRegex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

/*eslint-enable max-len */
function vimeoParser(url: string): string {
    const match = url.match(vimeoRegex);
    return match && typeof match[3] === 'string' ? match[3] : url;
}

const vineRegex = /^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/;

function vineParser(url: string): string {
    const match = url.match(vineRegex);
    return match && match[1].length === 11 ? match[1] : url;
}

const preziRegex = /^https:\/\/prezi.com\/(.[^/]+)/;

function preziParser(url: string): string {
    const match = url.match(preziRegex);
    return match ? match[1] : url;
}

function getVideoId(service: string, url: string): string | false {
    const serviceLower = service.toLowerCase();
    if (serviceLower === 'youtube') {
        return youtubeParser(url);
    } else if (serviceLower === 'vimeo') {
        return vimeoParser(url);
    } else if (serviceLower === 'vine') {
        return vineParser(url);
    } else if (serviceLower === 'prezi') {
        return preziParser(url);
    }
    return false;
}

function videoUrl(service: VideoService, videoID: string, options: VideoOptions): string {
    switch (service) {
        case 'youtube':
            return '//www.youtube.com/embed/' + videoID;
        case 'vimeo':
            return '//player.vimeo.com/video/' + videoID;
        case 'vine':
            return '//vine.co/v/' + videoID + '/embed/' + options.vine.embed;
        case 'prezi':
            return 'https://prezi.com/embed/' + videoID +
                '/?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=0&amp;autohide_ctrls=0&amp;' +
                'landing_data=bHVZZmNaNDBIWnNjdEVENDRhZDFNZGNIUE43MHdLNWpsdFJLb2ZHanI5N1lQVHkxSHFxazZ0UUNCRHloSXZROHh3PT0&amp;' +
                'landing_sign=1kD6c0N6aYpMUS0wxnQjxzSqZlEB8qNFdxtdjYhwSuI';
    }
}

function isEmbeddedVideo(url: string) {
    return url.match(/\.(webm|mp4|ogv)/) !== null;
}

function renderVideo(md: MarkdownIt, options: VideoOptions) {
    const altTokenizer = md.renderer['renderInlineAsText'];
    return (tokens: Token[], idx: number, env) => {
        const token = tokens[idx];
        const url = token.attrGet('src');
        if (!url) {
            return false;
        }
        token.attrs[token.attrIndex('alt')][1] = altTokenizer(token.children, options, env);
        const alt = token.attrGet('alt');
        if (alt && isVideoService(alt)) {
            return renderVideoService(md, options, alt, url);
        }
        if (isEmbeddedVideo(url)) {
            return renderEmbededVideo(md, options, url);
        }

        return false;
    }
}

function renderVideoService(md: MarkdownIt, options: VideoOptions, service: VideoService, url: string): string | false {
    const videoID = getVideoId(service, url as string);
    if (!videoID) {
        return false;
    }
    const escapedVideoId = md.utils.escapeHtml(videoID);
    const lowerService = service.toLowerCase() as VideoService;
    const height = options[lowerService].width / 16 * 9;
    return videoID === '' ? '' :
        '<div class="embed-responsive"><iframe class="embed-responsive-item" id="' +
        service + 'player" type="text/html" width="' + (options[lowerService].width) +
        '" height="' + (height) +
        '" src="' + videoUrl(lowerService, escapedVideoId, options) +
        '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
}

function renderEmbededVideo(md: MarkdownIt, options: VideoOptions, url: string) {
    url = md.utils.escapeHtml(url);
    return `<div class="embed-responsive"><video controls="controls" src="${url}"/></div>`;
}

export interface VideoServiceOptions {
    width: number;
}

export interface VineOptions extends VideoServiceOptions {
    embed: string;
}

export interface VideoOptions {
    youtube: VideoServiceOptions;
    vimeo: VideoServiceOptions;
    vine: VineOptions;
    prezi: VideoServiceOptions;
}

const defaults: VideoOptions = {
    youtube: {width: 640},
    vimeo: {width: 500},
    vine: {width: 600, embed: 'simple'},
    prezi: {width: 550}
};

export default function VideoPlugin(md: MarkdownIt, options: VideoOptions) {
    const originalRenderer = md.renderer.rules.image;
    md.renderer.rules.image = (tokens: Token[], idx: number, options: VideoOptions, env, slf) => {
        options = $.extend(defaults, options);
        const videoResult = renderVideo(md, options)(tokens, idx, env);
        return videoResult || originalRenderer(tokens, idx, options, env, slf)
    };
}
