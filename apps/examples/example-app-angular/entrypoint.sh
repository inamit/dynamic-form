#!/bin/sh
echo "window.env = {" > /usr/share/nginx/html/assets/env.js
echo "  MFE_URL: \"${MFE_URL:-http://localhost:5001}\"" >> /usr/share/nginx/html/assets/env.js
echo "};" >> /usr/share/nginx/html/assets/env.js

exec "$@"
