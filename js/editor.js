/* global OCA, marked, hljs, MathJax */

OCA.Files_Markdown = {};

OCA.Files_Markdown.vendorPromises = {};

OCA.Files_Markdown.Preview = function () {
	this.renderer = null;
	this.head = document.head;
	this.preview = _.throttle(this.previewText.bind(this), 500);
};

OCA.Files_Markdown.Preview.prototype.init = function () {
	var getUrl = this.getUrl.bind(this);

	$.when(
		OCA.Files_Markdown.Preview.loadVendor('marked', [
			'node_modules/marked/marked.min'
		]),
		OCA.Files_Markdown.Preview.loadVendor('highlight', [
			'node_modules/highlightjs/highlight.pack.min'
		], [
			'../js/node_modules/highlightjs/styles/github'
		]),
		OCA.Files_Markdown.Preview.loadVendor('katex', [
			'node_modules/katex/dist/katex.min',
			'node_modules/katex/dist/contrib/auto-render.min'
		], [
			'../js/node_modules/katex/dist/katex.min'
		])
	).then(function () {
		this.renderer = new marked.Renderer();
		var linkRenderer = this.renderer.link.bind(this.renderer);
		this.renderer.image = function (href, title, text) {
			var out = '<img src="' + getUrl(href) + '" alt="' + text + '"';
			if (title) {
				out += ' title="' + title + '"';
			}
			out += this.options.xhtml ? '/>' : '>';
			return out;
		};
		this.renderer.link = function(href, title, text) {
			var rendered = linkRenderer(href, title, text);
			var parser = document.createElement('a');
			parser.href = href;
			console.log(parser.hostname);
			if (parser.hostname !== window.location.hostname) {
				return rendered.replace("href=","target='_blank' rel='noopener' href=");
			} else {
				return rendered;
			}
		};

		this.renderer.code = function (code, language) {
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
			if (OCA.Files_Texteditor.file && OCA.Files_Texteditor.file.dir) {
				path = OCA.Files_Texteditor.file.dir + '/' + path;
			} else if (OCA.Files.App && OCA.Files.App.fileList._currentDirectory) {
				path = OCA.Files.App.fileList._currentDirectory + '/' + path;
			}
		}
		return OC.linkToRemote('files' + path.replace(/\/\/+/g, '/'));
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
	if (text.substr(0, 3) === '+++') {
		text = text.substr(3);
		text = text.substr(text.indexOf('+++') + 3);
	}

	return text;
};

OCA.Files_Markdown.Preview.loadVendor = function(name, scripts, styles) {
	if (!OCA.Files_Markdown.vendorPromises[name]) {
		if (styles) {
			for (var i = 0; i < styles.length; i++) {
				OC.addStyle('files_markdown', styles[i]);
			}
		}
		OCA.Files_Markdown.vendorPromises[name] = $.when(scripts.map(function(script) {
			return OC.addScript('files_markdown', script)
		}));
	}

	return OCA.Files_Markdown.vendorPromises[name];
};

$(document).ready(function () {
	if (OCA.Files_Texteditor && OCA.Files_Texteditor.registerPreviewPlugin) {
		OCA.Files_Texteditor.registerPreviewPlugin('text/markdown', new OCA.Files_Markdown.Preview());
	}
});

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
				OCA.Files_Markdown.Preview.loadVendor('marked', [
					'node_modules/marked/marked.min'
				]),
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
