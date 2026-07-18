#!/bin/bash
DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  exit 1
fi

if ! grep -q "[[:space:]]${DOMAIN}$" /etc/hosts; then
  echo "127.0.0.1 ${DOMAIN}" >> /etc/hosts
fi
