#!/bin/bash
DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  exit 1
fi

sed -i "/[[:space:]]${DOMAIN}$/d" /etc/hosts
