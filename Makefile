.PHONY: run
run:
	deno run --allow-net --allow-read src/app.ts

.PHONY: lint
lint:
	deno lint

.PHONY: fmt
fmt:
	deno fmt

.PHONY: check
check:
	deno check src/app.ts
