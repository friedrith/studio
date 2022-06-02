#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Studio Create Project
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.argument1 { "type": "text", "placeholder": "Placeholder" }

# Documentation:
# @raycast.author Thibault Friedrich
# @raycast.authorURL https://github.com/friedrith

workspaceProjects="/Users/thibault/Main Workspace/Projects"

mkdir -p "$workspaceProjects/$1"

(
  echo "---"
  echo "id: generate"
  echo "---"

  echo ""
  echo "# $1"
) > "$workspaceProjects/$1/README.md"

