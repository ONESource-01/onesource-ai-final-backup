#!/bin/bash
set -e

echo "🚀 Starting ONESource AI with Redis..."

# Ensure Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    apt-get update && apt-get install -y redis-server
fi

# Start supervisor which will start all services including Redis
echo "✅ Starting all services via supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf