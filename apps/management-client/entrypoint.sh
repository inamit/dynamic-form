#!/bin/sh
# Generate env.js using environment variables
echo "window.env = {" > /usr/share/nginx/html/env.js
echo "  API_BASE_URL: \"${API_BASE_URL:-http://localhost:3001/api}\"," >> /usr/share/nginx/html/env.js
echo "  MFE_URL: \"${MFE_URL:-http://localhost:5001}\"," >> /usr/share/nginx/html/env.js
echo "  PREVIEW_URL: \"${PREVIEW_URL:-http://localhost:5174}\"," >> /usr/share/nginx/html/env.js
echo "  MOCK_API_URL: \"${MOCK_API_URL:-http://localhost:4000}\"" >> /usr/share/nginx/html/env.js
echo "};" >> /usr/share/nginx/html/env.js

# Start nginx
exec "$@"
