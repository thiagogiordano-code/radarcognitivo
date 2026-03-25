#!/bin/sh
set -e

# Gera config.js com variáveis de ambiente em runtime
envsubst < /config.js.template > /usr/share/nginx/html/config.js

exec nginx -g "daemon off;"
