.PHONY: install dev build test typecheck lint

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm run test --workspace frontend

typecheck:
	npm run typecheck

lint:
	npm run lint
