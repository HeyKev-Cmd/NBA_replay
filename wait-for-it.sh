#!/bin/bash
# wait-for-it.sh script to wait for a service to be available

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" "${host#*:}"; do
  echo "Waiting for $host to be ready..."
  sleep 1
done

echo "$host is up - executing command"
exec $cmd 