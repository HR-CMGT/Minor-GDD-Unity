#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Starting HR Slide Edit Server on http://localhost:3333/ ..."
node "$DIR/edit_server.js"
