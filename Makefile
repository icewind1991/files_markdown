app_name=files_markdown
project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
sign_dir=$(build_dir)/sign
cert_dir=$(HOME)/.nextcloud/certificates

all: build/editor.js

sources=$(wildcard js/*.ts) $(wildcard js/*/*.ts) tsconfig.json .babelrc webpack.config.js

.PHONY: watch
watch: node_modules
	node_modules/.bin/webpack --watch --mode development

clean:
	rm -rf $(build_dir) node_modules

node_modules: package.json
	npm install

CHANGELOG.md: node_modules
	node_modules/.bin/changelog

build/editor.js: $(sources) node_modules
	node_modules/.bin/webpack --mode production
