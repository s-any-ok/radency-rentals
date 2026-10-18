#!/usr/bin/env bash
# One-shot backend setup for macOS: installs .NET 10 SDK, dotnet-ef and Docker Desktop,
# starts SQL Server, builds, creates the initial migration (once) and runs the tests.
# Usage: bash backend/scripts/setup-mac.sh
set -euo pipefail

# Apple Silicon: if this Terminal runs under Rosetta (x86_64), Homebrew in /opt/homebrew refuses
# to install. Re-run the whole script natively as arm64.
if [[ "$(uname -m)" == "x86_64" && "$(sysctl -in sysctl.proc_translated 2>/dev/null)" == "1" ]]; then
  echo "Terminal is running under Rosetta - re-running the script natively (arm64)..."
  exec arch -arm64 /bin/bash "$0" "$@"
fi

cd "$(dirname "$0")/.."
step() { printf "\n\033[1;34m==> %s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31m%s\033[0m\n" "$1"; exit 1; }

command -v brew >/dev/null || fail "Homebrew is not installed. Install it from https://brew.sh and run this script again."

export PATH="$PATH:/usr/local/share/dotnet:$HOME/.dotnet/tools"

step ".NET 10 SDK"
if dotnet --list-sdks 2>/dev/null | grep -q '^10\.'; then
  echo "Already installed: $(dotnet --version)"
else
  brew install --cask dotnet-sdk
fi
dotnet --list-sdks | grep -q '^10\.' || fail ".NET 10 SDK not found after install. Open a new terminal and run the script again."

step "dotnet-ef"
dotnet tool update --global dotnet-ef >/dev/null 2>&1 || dotnet tool install --global dotnet-ef
grep -q '.dotnet/tools' "$HOME/.zprofile" 2>/dev/null || echo 'export PATH="$PATH:$HOME/.dotnet/tools"' >> "$HOME/.zprofile"
dotnet ef --version

step "Docker Desktop"
if ! command -v docker >/dev/null; then
  brew install --cask docker-desktop || brew install --cask docker
fi
if ! docker info >/dev/null 2>&1; then
  open -a Docker
  echo "Waiting for Docker to start (accept the Docker license window if it appears)..."
  for _ in $(seq 1 100); do docker info >/dev/null 2>&1 && break; sleep 3; done
  docker info >/dev/null 2>&1 || fail "Docker didn't start. Open Docker Desktop manually, then run the script again."
fi

step "SQL Server (Docker)"
docker compose up -d
echo "Waiting for SQL Server (the first start under Rosetta can take a few minutes)..."
# Read the whole log first: "docker logs | grep -q" fails under pipefail (SIGPIPE) even when the line is there.
sql_ready() { local logs; logs="$(docker logs radency-sqlserver 2>&1 || true)"; [[ "$logs" == *"SQL Server is now ready for client connections"* ]]; }
for _ in $(seq 1 100); do
  sql_ready && break
  if [[ "$(docker inspect -f '{{.State.Running}}' radency-sqlserver 2>/dev/null)" != "true" ]]; then
    echo "The SQL Server container stopped. Last log lines:"
    docker logs --tail 40 radency-sqlserver 2>&1 || true
    fail "SQL Server crashed - send the log above."
  fi
  sleep 3
done
if ! sql_ready; then
  echo "Last log lines:"
  docker logs --tail 40 radency-sqlserver 2>&1 || true
  fail "SQL Server didn't become ready in 5 minutes - send the log above."
fi
echo "SQL Server is ready on localhost:1433"

step "Build"
dotnet build

step "Initial migration"
MIGRATIONS=src/Radency.Rentals.Infrastructure/Persistence/Migrations
if ls "$MIGRATIONS"/*.cs >/dev/null 2>&1; then
  echo "Migrations already exist, skipping."
else
  dotnet ef migrations add InitialCreate \
    --project src/Radency.Rentals.Infrastructure \
    --startup-project src/Radency.Rentals.Api \
    --output-dir Persistence/Migrations
fi

step "Tests"
dotnet test

printf "\n\033[1;32mAll set.\033[0m Start the API with:\n  cd %s && dotnet run --project src/Radency.Rentals.Api\nSwagger: http://localhost:5080/swagger\n" "$(pwd)"
