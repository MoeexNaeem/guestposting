#!/usr/bin/env bash
# One-time setup of guestposting.live on a server (run as root). Safe to re-run.
#
#   curl -fsSL https://raw.githubusercontent.com/MoeexNaeem/guestposting/main/scripts/server/setup.sh | bash
#
# Installs Node.js + PM2, downloads the site to /www/wwwroot/guestposting,
# asks for the .env values, builds and starts it, and puts nginx in front for
# guestposting.live (Cloudflare connects to it on port 443 or 80).
set -euo pipefail

# Everything runs inside main() so bash reads the whole script before running
# anything (with `curl | bash`, a command reading stdin could otherwise eat it).
main() {

APP_DIR=/www/wwwroot/guestposting
REPO=https://github.com/MoeexNaeem/guestposting.git
DOMAIN=guestposting.live
PORT=3100

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m!!  %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mXX  %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || die "Please run this as root."

if command -v apt-get >/dev/null 2>&1; then PKG=apt
elif command -v dnf >/dev/null 2>&1; then PKG=dnf
elif command -v yum >/dev/null 2>&1; then PKG=yum
else die "Unsupported system (no apt, dnf or yum)."; fi
pkg_install() {
  if [ "$PKG" = apt ]; then DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"; else "$PKG" install -y "$@"; fi
}

# ---------------------------------------------------------------- 1. tools
say "1/6 Installing basic tools"
[ "$PKG" = apt ] && apt-get update -y >/dev/null
pkg_install git curl openssl ca-certificates >/dev/null

node_ok() {
  command -v node >/dev/null 2>&1 &&
    node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)'
}
if node_ok; then
  echo "Node.js $(node -v) already installed"
else
  say "Installing Node.js 22"
  if [ "$PKG" = apt ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  else
    curl -fsSL https://rpm.nodesource.com/setup_22.x | bash - >/dev/null
  fi
  pkg_install nodejs >/dev/null
  hash -r
  node_ok || die "Node.js 20.9+ is required but $(node -v 2>/dev/null || echo 'none') is active."
fi
command -v pm2 >/dev/null 2>&1 || { say "Installing PM2"; npm install -g pm2 >/dev/null; }

# ---------------------------------------------------------------- 2. code
say "2/6 Getting the code"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  echo "Already downloaded, deploy.sh will update it"
elif [ -e "$APP_DIR" ] && [ -n "$(ls -A "$APP_DIR" 2>/dev/null)" ]; then
  die "$APP_DIR exists and is not empty. Move it away and run this again."
else
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ---------------------------------------------------------------- 3. .env
say "3/6 Settings (.env)"
if [ -f .env ]; then
  echo "Keeping the existing $APP_DIR/.env"
else
  echo "Paste each value from your local .env (D:\\LET RANK\\GUEST POST WEBSITE\\.env), then press Enter."
  echo "Secret values stay hidden while you paste."
  ask() { # ask VAR "label" [secret]
    local value=""
    while [ -z "$value" ]; do
      if [ "${3:-}" = secret ]; then read -r -s -p "$2: " value </dev/tty; echo " (received)"
      else read -r -p "$2: " value </dev/tty; fi
    done
    printf '%s=%s\n' "$1" "$value" >> .env.tmp
  }
  umask 077
  rm -f .env.tmp
  ask MONGO_URI "MONGO_URI" secret
  ask JWT_SECRET "JWT_SECRET (keep the same one so users stay logged in)" secret
  ask MY_EMAIL "MY_EMAIL (the Gmail address)"
  ask EMAIL_PASSWORD "EMAIL_PASSWORD (the Gmail app password)" secret
  printf 'FRONTEND_URL=https://%s\n' "$DOMAIN" >> .env.tmp
  mv .env.tmp .env
  chmod 600 .env
  echo "Saved $APP_DIR/.env"
fi

# ---------------------------------------------------------------- 4. build + run
say "4/6 Building and starting the site (takes a few minutes)"
if ss -ltnH "sport = :$PORT" 2>/dev/null | grep -q . && ! pm2 describe guestposting >/dev/null 2>&1; then
  die "Port $PORT is already used by another program."
fi
bash scripts/server/deploy.sh
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || warn "Could not enable PM2 start-on-boot (run: pm2 startup)."
pm2 save >/dev/null

# ---------------------------------------------------------------- 5. nginx
say "5/6 Setting up nginx for $DOMAIN"
# aaPanel may already run another web server (OpenLiteSpeed/Apache) on port 80.
# Cloudflare's "Full" SSL mode only connects on port 443, so in that case nginx
# serves guestposting.live on 443 alone and leaves port 80 to the other server.
OWNER80=$(ss -ltnpH 'sport = :80' 2>/dev/null | grep -o '(("[^"]*"' | head -1 | tr -d '("' || true)
HTTPS_ONLY=0
if [ -n "$OWNER80" ] && [ "$OWNER80" != nginx ]; then
  HTTPS_ONLY=1
  echo "Port 80 belongs to $OWNER80 (left untouched); nginx will serve $DOMAIN on port 443"
fi

if [ -x /www/server/nginx/sbin/nginx ]; then
  NGINX=/www/server/nginx/sbin/nginx
  CONF_DIR=/www/server/panel/vhost/nginx
  SYSTEM_NGINX=0
  echo "Using aaPanel's nginx"
else
  SYSTEM_NGINX=1
  CONF_DIR=/etc/nginx/conf.d
  if ! command -v nginx >/dev/null 2>&1; then
    echo "Installing nginx"
    if [ "$HTTPS_ONLY" = 1 ] && [ "$PKG" = apt ] && [ ! -e /usr/sbin/policy-rc.d ]; then
      # The nginx package starts itself on port 80 right after installing; that
      # port is taken, so hold the auto-start back until our config is in place.
      printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d
      chmod +x /usr/sbin/policy-rc.d
      pkg_install nginx >/dev/null || { rm -f /usr/sbin/policy-rc.d; die "Installing nginx failed."; }
      rm -f /usr/sbin/policy-rc.d
    else
      pkg_install nginx >/dev/null
    fi
  fi
  NGINX=$(command -v nginx)
  if [ "$HTTPS_ONLY" = 1 ]; then
    # Ubuntu/Debian's default site also listens on port 80.
    rm -f /etc/nginx/sites-enabled/default
    if grep -qE '^\s*listen\s+80' /etc/nginx/nginx.conf 2>/dev/null; then
      die "/etc/nginx/nginx.conf has its own server on port 80 (taken by $OWNER80). Remove that server block and run this again."
    fi
  fi
fi
mkdir -p "$CONF_DIR"

# Long-lived certificate for the Cloudflare -> server hop (Cloudflare SSL mode "Full").
CERT_DIR=/etc/ssl/guestposting
if [ ! -s "$CERT_DIR/fullchain.pem" ]; then
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
    -subj "/CN=$DOMAIN" -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN" \
    -keyout "$CERT_DIR/privkey.pem" -out "$CERT_DIR/fullchain.pem" >/dev/null 2>&1
  chmod 600 "$CERT_DIR/privkey.pem"
fi

if [ "$HTTPS_ONLY" = 1 ]; then
  LISTEN="listen 443 ssl;"
else
  LISTEN="listen 80;
    listen 443 ssl;"
fi

cat > "$CONF_DIR/$DOMAIN.conf" <<EOF
# guestposting.live -> Next.js on 127.0.0.1:$PORT (written by scripts/server/setup.sh)
server {
    $LISTEN
    server_name www.$DOMAIN;
    ssl_certificate     $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    return 301 https://$DOMAIN\$request_uri;
}

server {
    $LISTEN
    server_name $DOMAIN;
    ssl_certificate     $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }
}
EOF

"$NGINX" -t || die "nginx rejected the config ($CONF_DIR/$DOMAIN.conf)."
if [ "$SYSTEM_NGINX" = 1 ]; then
  systemctl enable nginx >/dev/null 2>&1 || true
  systemctl restart nginx || die "nginx did not start. See: journalctl -u nginx -n 30"
else
  "$NGINX" -s reload 2>/dev/null || "$NGINX"
fi

# Open the web port(s) if a firewall is running (SSH and aaPanel rules are untouched).
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow 443/tcp >/dev/null
  if [ "$HTTPS_ONLY" = 0 ]; then ufw allow 80/tcp >/dev/null; fi
elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=https >/dev/null
  if [ "$HTTPS_ONLY" = 0 ]; then firewall-cmd --permanent --add-service=http >/dev/null; fi
  firewall-cmd --reload >/dev/null
fi

# ---------------------------------------------------------------- 6. checks
say "6/6 Checking"
problems=0
if [ "$HTTPS_ONLY" = 0 ]; then
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $DOMAIN" http://127.0.0.1/ || true)
  if [ "$code" = 200 ]; then echo "OK   $DOMAIN answers through nginx on port 80"; else warn "nginx returned $code for $DOMAIN on port 80"; problems=1; fi
fi

code=$(curl -sk -o /dev/null -w '%{http_code}' --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" || true)
if [ "$code" = 200 ]; then echo "OK   $DOMAIN answers through nginx on port 443"; else warn "HTTPS returned $code"; problems=1; fi

code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 40 "http://127.0.0.1:$PORT/api/listings" || true)
if [ "$code" = 200 ]; then
  echo "OK   database connected"
else
  warn "The database did not answer (HTTP $code). In MongoDB Atlas > Network Access, add this server's IP: $(curl -s --max-time 5 https://api.ipify.org || echo 'see your server IP'), then run: pm2 restart guestposting"
  problems=1
fi

if [ "$problems" = 0 ]; then
  say "Setup complete. guestposting.live should now load through Cloudflare (SSL/TLS mode: Full)."
  if [ "$HTTPS_ONLY" = 1 ]; then echo "Note: port 80 belongs to $OWNER80, so Cloudflare's SSL/TLS mode must stay on Full, not Flexible."; fi
else
  warn "Setup finished with the problems above."
fi
echo
echo "Future updates:  bash $APP_DIR/scripts/server/deploy.sh"
}

main "$@"
