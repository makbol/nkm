#!/bin/bash

RED="\033[0;31m"
NORMAL="\033[0m"

# create dir if not existent
mkdir -p .git/hooks
# Install yourself on first execution
if [ ! -f .git/hooks/pre-commit ]; then
  echo "Installing pre-commit hook..."
  ln -s ../../pre-commit.sh .git/hooks/pre-commit
fi

# ESLint
./node_modules/.bin/eslint nkm.user.js || exit 1;