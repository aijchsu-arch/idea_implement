# 第 4 層：一個指令跑完所有品質檢查。pre-commit hook 與 CI 都只呼叫 `make check`。
# 本 repo 目前只有測試（node --test）；之後加 lint / typecheck 時，在 check 的依賴加上即可。
.PHONY: check test

check: test
	@echo "[check] all passed"

test:
	npm test
