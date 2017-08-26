app_name=files_markdown
project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build/artifacts
sign_dir=$(build_dir)/sign
cert_dir=$(HOME)/.nextcloud/certificates

all: js/editor.js

sources=$(wildcard js/*.ts) $(wildcard js/*/*.ts) tsconfig.json .babelrc webpack.config.js

.PHONY: watch
watch: node_modules
	node_modules/.bin/webpack --watch

clean:
	rm -rf $(build_dir)

node_modules: package.json
	npm install

js/editor.js: $(sources) node_modules
	NODE_ENV=production node_modules/.bin/webpack

appstore: clean js/node_modules
	mkdir -p $(sign_dir)
	rsync -a \
	--exclude=.git \
	--exclude=build \
	--exclude=.gitignore \
	--exclude=Makefile \
	--exclude=screenshots \
	--exclude=phpunit*xml \
	$(project_dir) $(sign_dir)
	tar -czf $(build_dir)/$(app_name).tar.gz \
		-C $(sign_dir) $(app_name)
	openssl dgst -sha512 -sign $(cert_dir)/$(app_name).key $(build_dir)/$(app_name).tar.gz | openssl base64
