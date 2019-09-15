import {Renderer} from './Renderer';
import {throttle, debounce} from 'throttle-debounce';
import {PasteImage} from './PasteImage';
import Thenable = JQuery.Thenable;
import TextEditorPreviewPlugin = OCA.Files_Texteditor.TextEditorPreviewPlugin;

declare const aceEditor: AceAjax.Editor;

type onPopstate = (this: Window, ev: PopStateEvent) => any;

const scrollOffsetLines = 3;

export class PreviewPlugin implements TextEditorPreviewPlugin {
    private renderer: Renderer;
    private rangeConstructor: new (startRow: number, startColumn: number, endRow: number, endColumn: number) => AceAjax.Range;

    private initPromise: Promise<void> | null = null;
    private textEditorOnHashChange: onPopstate | null;
    private offsetMap: number[] = [];
    private session: AceAjax.IEditSession;
    private previewElement: JQuery;
    private scrollMode: 'editor' | 'preview' | null = null;

    init() {
        if (!this.initPromise) {
            this.initPromise = import('./Renderer').then(({Renderer}) => {
                this.renderer = new Renderer();
            }, console.error.bind(console));
            if (!this.textEditorOnHashChange) {
                this.textEditorOnHashChange = window.onpopstate;
            }

            const aceRequire = window['ace']['acequire'] || window['ace'].require;
            this.rangeConstructor = aceRequire("ace/range").Range;

            new PasteImage().listen(this.handleImage);
        }

        return this.initPromise;
    }

    initAceHooks() {
        if (this.session !== aceEditor.getSession()) {
            this.session = aceEditor.getSession();
            aceEditor.$blockScrolling = Infinity;
            this.session.on("changeScrollTop", this.onScrollEditor);
        }
    }

    initPreviewHooks(element) {
        if (this.previewElement !== element) {
            this.previewElement = element;
            this.previewElement.scroll(this.onScrollPreview);
            this.initCheckboxHandler(element);
        }
    }

    onHashChange(e: PopStateEvent) {
        const hash = window.location.hash.substr(1);
        if (hash.substr(0, 6) !== 'editor' && this.textEditorOnHashChange) {
            this.textEditorOnHashChange.call(window, e)
        }
    }

    preview = throttle(500, (text: string, element) => {
        this.initAceHooks();
        this.initPreviewHooks(element);
        window.onpopstate = this.onHashChange;

        this.init().then(() => {
            this.renderer.renderText(text, element).then(() => {
                setTimeout(() => {
                    this.buildOffsetMap(element)
                }, 500);
            });
        });
    });

    initCheckboxHandler(element) {
        const Range = this.rangeConstructor;
        const session = this.session;
        element.on('change', 'input[type=checkbox]', function () {
            const checked = this.checked;
            const row = this.dataset.line;
            const oldText = session.getLine(row);
            const index = oldText.indexOf('[') + 1;
            session.replace(new Range(row, index, row, index + 1), checked ? 'x' : ' ');
            session['$wrapData'].length = session.doc.getLength();
        });
    }

    buildOffsetMap = throttle(1000, (element) => {
        const previewOffset = (element.offset() as { top: number }).top;
        const offsetMap: number[] = [];
        element.find('[data-line]').each(function () {
            offsetMap[parseInt(this.dataset.line, 10)] = ($(this).offset() as { top: number }).top - previewOffset;
        });
        this.offsetMap = offsetMap;
    });

    onScrollEditor = throttle(100, (top: number) => {
        if (this.scrollMode === 'preview') {
            return;
        }
        this.scrollMode = 'editor';
        const line = Math.max(0, Math.floor(top / 15) - scrollOffsetLines);
        const previewOffset = this.offsetMap.find((offset, index) => (typeof offset !== 'undefined') && index >= line);
        if (typeof previewOffset !== 'undefined') {
            $('#preview').scrollTop(previewOffset);
        }
        this.resetScrollMode();
    });

    onScrollPreview = throttle(100, () => {
        if (this.scrollMode === 'editor') {
            return;
        }
        this.scrollMode = 'preview';
        const top = this.previewElement.scrollTop() as number;
        const previewLine = this.offsetMap.findIndex(offset => offset >= (top - 1));
        if (previewLine < this.session.getLength()) {
            aceEditor.scrollToLine(Math.max(previewLine - scrollOffsetLines, 0), false, true, () => {
            });
        }
        this.resetScrollMode();
    });

    resetScrollMode = debounce(500, () => {
        this.scrollMode = null;
    });

    handleImage = (image: HTMLImageElement, file) => {
        OC.dialogs.prompt('Enter the name for the image', 'Upload image', (ok, name) => {
            if (!ok) {
                return;
            }
            const blob = image.src;
            const cursorPos = aceEditor.getCursorPosition();
            const uploadText = `![uploading...](${blob})`;
            const finalText = `![${name}](${name})`;
            this.session.insert(cursorPos, uploadText);
            this.uploadImage(name, file).then(() => {
                this.session.replace(
                    new this.rangeConstructor(cursorPos.row, cursorPos.column, cursorPos.row, cursorPos.column + uploadText.length),
                    finalText
                );
            });

        }, true, 'image name');
    };

    uploadImage(name: string, file: File): Thenable<void> {
        const path = `${this.getCurrentPath()}/${name}`.replace(/\/\/+/g, '/');
        const url = OC.linkToRemote('files' + path);
        const reader = new FileReader();
        const deferred = $.Deferred();
        reader.onloadend = (e) => {
            if (reader.result) {
                $.ajax({
                    url: url,
                    processData: false,
                    data: reader.result.toString(),
                    type: 'PUT',
                    success: deferred.resolve.bind(deferred),
                    error: deferred.reject.bind(deferred)
                });
            }
        };
        reader.readAsArrayBuffer(file);
        return deferred.promise();
    }

    getCurrentPath() {
        if (OCA.Files_Texteditor.file && OCA.Files_Texteditor.file.dir) {
            return OCA.Files_Texteditor.file.dir;
        } else if (OCA.Files.App && OCA.Files.App.fileList._currentDirectory) {
            return OCA.Files.App.fileList._currentDirectory;
        }
    }
}
