#!/bin/sh
set -eu
: "${GEMINI_API_KEY:?GEMINI_API_KEY não definida}"
envsubst '${GEMINI_API_KEY}' \
  < /usr/share/nginx/html/config.js.template \
  > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
