#!/bin/bash

# Klash Contract Upgrade Script
# This script proposes and executes an upgrade to the Klash contracts

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if new version address is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <NEW_VERSION_ADDRESS>"
    echo "Please provide the address of the new contract version"
    exit 1
fi

NEW_VERSION_ADDRESS=$1
UPGRADE_DELAY=86400  # 24 hours in seconds

# Compile contracts
echo -e "${GREEN}Compiling contracts...${NC}"
aptos move compile

# Run tests
echo -e "${GREEN}Running tests...${NC}"
aptos move test

# Get current version
CURRENT_VERSION=$(aptos move view --function-id 'default::config::get_version' | grep -o '[0-9]*' | tail -1)
NEW_VERSION=$((CURRENT_VERSION + 1))

# Propose upgrade
echo -e "${GREEN}Proposing upgrade to version ${NEW_VERSION} at address ${NEW_VERSION_ADDRESS}...${NC}"
aptos move run \
    --function-id 'default::config::propose_upgrade' \
    --args "u64:${NEW_VERSION}" "address:${NEW_VERSION_ADDRESS}" "u64:${UPGRADE_DELAY}" \
    --profile default \
    --url https://testnet.aptoslabs.com

echo -e "${GREEN}Upgrade proposed with a ${UPGRADE_DELAY} second timelock.${NC}"
echo -e "${GREEN}After the timelock has passed, execute the upgrade with:${NC}"
echo "./execute_upgrade.sh <PROPOSAL_ID>"

# Create execute_upgrade.sh script
cat > execute_upgrade.sh << EOL
#!/bin/bash

# Execute the proposed upgrade
# Usage: ./execute_upgrade.sh <PROPOSAL_ID>

if [ -z "\$1" ]; then
    echo "Usage: \$0 <PROPOSAL_ID>"
    echo "Please provide the proposal ID to execute"
    exit 1
fi

echo "Executing upgrade for proposal ID: \$1"
aptos move run \
    --function-id 'default::config::execute_upgrade' \
    --args "u64:\$1" \
    --profile default \
    --url https://testnet.aptoslabs.com

echo "Upgrade executed successfully!"
EOL

chmod +x execute_upgrade.sh

echo -e "${GREEN}Created execute_upgrade.sh script. Run it after the timelock has passed.${NC}"
