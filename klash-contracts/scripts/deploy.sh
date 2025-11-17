#!/bin/bash

# Klash Contract Deployment Script
# This script compiles, tests, and deploys the Klash contracts to the Aptos testnet

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Compile contracts
echo -e "${GREEN}Compiling contracts...${NC}"
aptos move compile

# Run tests
echo -e "${GREEN}Running tests...${NC}" 
aptos move test

# Deploy to testnet
echo -e "${GREEN}Deploying to testnet...${NC}"
aptos move publish --assume-yes --profile default --url https://testnet.aptoslabs.com --named-addresses klash=default

# Initialize config
# Note: Replace ADMIN_ADDRESS with the actual admin address
echo -e "${GREEN}Initializing config...${NC}"
aptos move run --function-id 'default::config::initialize' --profile default --url https://testnet.aptoslabs.com

# Initialize treasury
echo -e "${GREEN}Initializing treasury...${NC}"
aptos move run --function-id 'default::treasury::initialize' --profile default --url https://testnet.aptoslabs.com

echo -e "${GREEN}Deployment complete!${NC}"
echo "Contract version: 1"
echo "Admin address: [YOUR_ADDRESS]"
echo "Explorer: https://explorer.aptoslabs.com/account/[YOUR_ADDRESS]"
