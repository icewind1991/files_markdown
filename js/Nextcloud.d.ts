interface EscapeOptions {
    escape?: boolean;
}

interface BasePlugin {
    attach: Function;
}

type SidebarPreviewRender = (model, $thumbnailDiv: JQuery, $thumbnailContainer: JQuery, fallback: () => void) => void;

interface SidebarPreviewPlugin extends BasePlugin {
    attach: (manager: {
        addPreviewHandler: (mimetype: string, renderer: SidebarPreviewRender) => void;
    }) => void;
}

declare const OCA: { [appname: string]: any };

declare namespace OC {
    namespace Util {
        function humanFileSize(size: number): string;

        function computerFileSize(size: string): number;
    }

    namespace dialogs {
        function info(text: string, title: string, callback: () => void, modal?: boolean): void;

        function confirm(text: string, title: string, callback: (result: boolean) => void, modal?: boolean): void;

        function confirmHtml(text: string, title: string, callback: (result: boolean) => void, modal?: boolean): void;

        function prompt(text: string, title: string, callback: (result: string) => void, modal?: boolean, name?: string, password?: boolean): void;

        function filepicker(title: string, callback: (result: string | string[]) => void, multiselect?: boolean, mimetypeFilter?: string, modal?: boolean): void;
    }

    namespace Plugins {
        function register(scope: string, plugin: BasePlugin);
        function register(scope: 'OCA.Files.SidebarPreviewManager', plugin: SidebarPreviewPlugin);
    }

    function generateUrl(url: string, parameters?: { [key: string]: string }, options?: EscapeOptions)

    function linkToOCS(service: string, version: number): string;

    function imagePath(app: string, file: string): string;

    function linkToRemote(service: string): string;

    function linkToRemoteBase(service: string): string;

    function filePath(app: string, type: string, path: string): string;

    function addStyle(app: string, stylesheet: string): void;

    function addScript(app: string, script: string, callback?: Function): JQueryPromise<void>

    const PERMISSION_CREATE = 4;
    const PERMISSION_READ = 1;
    const PERMISSION_UPDATE = 2;
    const PERMISSION_DELETE = 8;
    const PERMISSION_SHARE = 16;
    const PERMISSION_ALL = 31;
}

declare function t(app: string, string: string, vars?: { [key: string]: string }, count?: number, options?: EscapeOptions): string;

declare module 'NC' {
    export interface OCSResult<T> {
        ocs: {
            data: T;
            meta: {
                status: 'ok' | 'failure';
                message: string;
                statuscode: number;
                totalitems: number;
                itemsperpage: number;
            }
        }
    }
}
