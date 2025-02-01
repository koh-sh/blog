.PHONY: server new mod build ss dev setup

server:
	hugo server

dev:
	@echo "Starting development environment..."
	@trap 'kill 0; exit 0' SIGINT SIGTERM; \
	hugo server & \
	wrangler pages dev . & \
	sleep 1 && open http://localhost:1313/ & \
	wait

setup:
	npm install -g wrangler

# Create a new article (interactive)
new:
	@read -p "Enter the article filename (e.g. example.md): " post_name; \
	hugo new posts/$$post_name

mod:
	hugo mod get -u

build:
	hugo

# convert screenshot to avif and mv to images
ss:
	./_utils/makeavif.sh
