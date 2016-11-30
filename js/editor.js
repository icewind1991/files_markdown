/* global OCA, marked, hljs, MathJax */

OCA.Files_Markdown = {};

OCA.Files_Markdown.mathJaxLoaded = false;
OCA.Files_Markdown.markedLoadPromise = null;
OCA.Files_Markdown.highlightLoaded = null;
OCA.Files_Markdown.katexLoadPromise = null;

OCA.Files_Markdown.Preview = function () {
	this.renderer = null;
	this.head = document.head;
	this.preview = _.throttle(this.previewText.bind(this), 500);
};

OCA.Files_Markdown.Preview.prototype.init = function () {
	var getUrl = this.getUrl.bind(this);

	$.when(
		OCA.Files_Markdown.Preview.loadMarked(),
		OCA.Files_Markdown.Preview.loadHighlight(),
		OCA.Files_Markdown.Preview.loadKaTeX()
	).then(function () {
		this.renderer = new marked.Renderer();
		this.renderer.image = function (href, title, text) {
			var out = '<img src="' + getUrl(href) + '" alt="' + text + '"';
			if (title) {
				out += ' title="' + title + '"';
			}
			out += this.options.xhtml ? '/>' : '>';
			return out;
		};

		this.renderer.code = function(code, language) {
			// Check whether the given language is valid for highlight.js.
			const validLang = !!(language && hljs.getLanguage(language));
			// Highlight only if the language is valid.
			const highlighted = validLang ? hljs.highlight(language, code).value : code;
			// Render the highlighted code with `hljs` class.
			return '<pre><code class="hljs ' + language + '">' + highlighted + '</code></pre>';
		};


		marked.setOptions({
			renderer: this.renderer,
			headerPrefix: 'md-'
		});
	}.bind(this));
};

OCA.Files_Markdown.Preview.prototype.getUrl = function (path) {
	if (!path) {
		return path;
	}
	if (path.substr(0, 7) === 'http://' || path.substr(0, 8) === 'https://' || path.substr(0, 3) === '://') {
		return path;
	} else {
		if (path.substr(0, 1) !== '/') {
			path = OCA.Files_Texteditor.file.dir + '/' + path;
		}
		return OC.generateUrl('apps/files/ajax/download.php?dir={dir}&files={file}', {
			dir: OC.dirname(path),
			file: OC.basename(path)
		});
	}
};

OCA.Files_Markdown.Preview.prototype.previewText = function (text, element) {
	var html = marked(prepareText(text));
	element.html(html);
	renderMathInElement(element.get(0), {
		delimiters: [
			{left: "$$", right: "$$", display: true},
			{left: "$", right: "$", display: false}
		]
	})
};

var prepareText = function (text) {
	text = text.trim();
	if (text.substr(0, 3) === '+++') {
		text = text.substr(3);
		text = text.substr(text.indexOf('+++') + 3);
	}

	return text;
};

OCA.Files_Markdown.Preview.loadMarked = function () {
	if (!OCA.Files_Markdown.markedLoadPromise) {
		OCA.Files_Markdown.markedLoadPromise = OC.addScript('files_markdown', 'core/vendor/marked/marked.min');
	}
	return OCA.Files_Markdown.markedLoadPromise;
};

OCA.Files_Markdown.Preview.loadHighlight = function () {
	if (!OCA.Files_Markdown.highlightLoadPromise) {
		OC.addStyle('files_markdown', '../js/core/vendor/highlightjs/styles/github');
		OCA.Files_Markdown.highlightLoadPromise = OC.addScript('files_markdown', 'core/vendor/highlightjs/highlight.pack.min');
	}
	return OCA.Files_Markdown.highlightLoadPromise;
};

OCA.Files_Markdown.Preview.loadKaTeX = function () {
	if (!OCA.Files_Markdown.katexLoadPromise) {
		OC.addStyle('files_markdown', '../js/core/vendor/KaTeX/dist/katex.min');
		OCA.Files_Markdown.katexLoadPromise = $.when(
			OC.addScript('files_markdown', 'core/vendor/KaTeX/dist/katex.min'),
			OC.addScript('files_markdown', 'core/vendor/KaTeX/dist/contrib/auto-render.min')
		);
	}
	return OCA.Files_Markdown.katexLoadPromise;
};

$(document).ready(function () {
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', new OCA.Files_Markdown.Preview());
	}
});

/*
 * Copyright (c) 2016
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

(function () {

	var SidebarPreview = function () {
		this.preview = new OCA.Files_Markdown.Preview();
		this.preview.init();
	};

	SidebarPreview.prototype = {
		attach: function (manager) {
			manager.addPreviewHandler('text/markdown', this.handlePreview.bind(this));
		},

		handlePreview: function (model, $thumbnailDiv, $thumbnailContainer, fallback) {
			var previewWidth = $thumbnailContainer.parent().width() + 50;  // 50px for negative margins
			var previewHeight = previewWidth / (16 / 9);

			$.when(
				OCA.Files_Markdown.Preview.loadMarked(),
				this.getFileContent(model.getFullPath())
			).then(function (_, content) {
				$thumbnailDiv.removeClass('icon-loading icon-32');
				$thumbnailContainer.addClass('large');
				$thumbnailContainer.addClass('text');
				var $textPreview = $('<div id="preview" class="text-markdown"/>');
				this.preview.previewText(content[0], $textPreview);
				$thumbnailDiv.children('.stretcher').remove();
				$thumbnailDiv.append($textPreview);
				$thumbnailContainer.css("max-height", previewHeight);
			}.bind(this), function () {
				fallback();
			});
		},

		getFileContent: function (path) {
			var url = OC.linkToRemoteBase('files' + path);
			return $.get(url);
		}
	};

	OC.Plugins.register('OCA.Files.SidebarPreviewManager', new SidebarPreview());
})();
