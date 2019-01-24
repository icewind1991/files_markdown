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

build/editor.js: $(sources) node_modules
	node_modules/.bin/webpack --mode production

appstore: build/editor.js
	mkdir -p $(sign_dir)
	rsync -a \
	--exclude=.git \
	--exclude=build/artifacts \
	--exclude=.gitignore \
	--exclude=Makefile \
	--exclude=node_modules \
	--exclude=screenshots \
	--exclude=phpunit*xml \
	$(project_dir) $(sign_dir)
	tar -czf $(build_dir)/$(app_name).tar.gz \
		-C $(sign_dir) $(app_name)
	openssl dgst -sha512 -sign $(cert_dir)/$(app_name).key $(build_dir)/$(app_name).tar.gz | openssl base64
