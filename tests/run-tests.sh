#!/bin/bash
# Test Suite for Sincronizado

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0

test_start() {
    echo ""
    echo "Running: $1"
}

test_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((passed++))
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((failed++))
}

echo "========================================="
echo "  Sincronizado Test Suite"
echo "========================================="

# Test 1: Project structure
test_start "Project structure"
[[ -f README.md ]] && test_pass "README.md exists" || test_fail "README.md missing"
[[ -f LICENSE ]] && test_pass "LICENSE exists" || test_fail "LICENSE missing"
[[ -d .planning ]] && test_pass ".planning/ exists" || test_fail ".planning/ missing"
[[ -d scripts ]] && test_pass "scripts/ exists" || test_fail "scripts/ missing"
[[ -d launcher ]] && test_pass "launcher/ exists" || test_fail "launcher/ missing"
[[ -d config ]] && test_pass "config/ exists" || test_fail "config/ missing"

# Test 2: Scripts executable
test_start "Script permissions"
[[ -x scripts/setup-vps.sh ]] && test_pass "setup-vps.sh executable" || test_fail "setup-vps.sh not executable"
[[ -x scripts/rollback-vps.sh ]] && test_pass "rollback-vps.sh executable" || test_fail "rollback-vps.sh not executable"
[[ -x launcher/opencode.sh ]] && test_pass "opencode.sh executable" || test_fail "opencode.sh not executable"

# Test 3: Configuration files
test_start "Configuration files"
[[ -f config/.opencode.config.json ]] && test_pass "config template exists" || test_fail "config template missing"
[[ -f .editorconfig ]] && test_pass ".editorconfig exists" || test_fail ".editorconfig missing"
[[ -f package.json ]] && test_pass "package.json exists" || test_fail "package.json missing"

# Test 4: Documentation
test_start "Documentation"
[[ -f docs/docs/intro.md ]] && test_pass "intro.md exists" || test_fail "intro.md missing"
[[ -f docs/docs/quick-start.md ]] && test_pass "quick-start.md exists" || test_fail "quick-start.md missing"
[[ -f docs/docs/architecture.md ]] && test_pass "architecture.md exists" || test_fail "architecture.md missing"

# Test 5: GitHub Actions
test_start "CI/CD workflows"
[[ -f .github/workflows/ci.yml ]] && test_pass "ci.yml exists" || test_fail "ci.yml missing"
[[ -f .github/workflows/lint.yml ]] && test_pass "lint.yml exists" || test_fail "lint.yml missing"
[[ -f .github/workflows/test.yml ]] && test_pass "test.yml exists" || test_fail "test.yml missing"

# Test 6: Launcher scripts valid
test_start "Launcher script syntax"
bash -n launcher/opencode.sh 2>/dev/null && test_pass "opencode.sh syntax valid" || test_fail "opencode.sh has syntax errors"

# Summary
echo ""
echo "========================================="
echo "  Test Results"
echo "========================================="
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo ""

if [[ $failed -eq 0 ]]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed${NC}"
    exit 1
fi
