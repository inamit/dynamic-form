#!/bin/sh
echo "window.env = {" > /usr/share/nginx/html/env.js
echo "  API_BASE_URL: \"${API_BASE_URL:-http://localhost:3001/api}\"" >> /usr/share/nginx/html/env.js
echo "};" >> /usr/share/nginx/html/env.js

exec "$@"
