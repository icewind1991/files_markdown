import MarkdownIt from "markdown-it";
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
export default function VideoPlugin(md: MarkdownIt, options: VideoOptions): void;
