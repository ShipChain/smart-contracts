#!/bin/sh

# Add local user
# Either use the LOCAL_USER_ID if passed in at runtime or
# fallback

USER_ID=${LOCAL_USER_ID:-9001}
GROUP_ID=${LOCAL_GROUP_ID:-9001}

echo "Starting with GUID:UID : $GROUP_ID:$USER_ID"
addgroup -g $GROUP_ID -S username  && adduser -u $USER_ID -S username -G username
export HOME=/home/username

exec su-exec $USER_ID:$GROUP_ID "$@"
