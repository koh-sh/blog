.PHONY: server new mod build ss dev setup

POST = example.md

server:
	hugo server

dev:
	@echo "Starting development environment..."
	@trap 'kill 0; exit 0' SIGINT SIGTERM; \
	hugo server & \
	wrangler pages dev . & \
	wait

setup:
	npm install -g wrangler

# make new POST=test.md
new:
	hugo new posts/${POST}

mod:
	hugo mod get -u

build:
	hugo

# convert screenshot to avif and mv to images
ss:
	./_utils/makeavif.sh
