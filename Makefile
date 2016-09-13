all: test

deps:
	npm install

test: deps
	npm run test
	
build: test

clean:
	rm -rf go-ipfs/
	rm -rf node_modules/

.PHONY: all test build
