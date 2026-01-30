#!/bin/bash
# AWS VPS Setup Helper
# Creates EC2 instance and configures security groups

set -euo pipefail

echo "AWS VPS Setup Helper"
echo "===================="
echo ""
echo "This script helps configure AWS EC2 for Sincronizado."
echo ""
echo "Prerequisites:"
echo "  - AWS CLI installed and configured"
echo "  - IAM permissions for EC2 and Security Groups"
echo ""

read -p "Continue? (y/N): " response
if [[ "$response" != "y" ]]; then
    exit 0
fi

echo ""
echo "Creating security group..."

# Create security group
aws ec2 create-security-group \
    --group-name sincronizado-sg \
    --description "Sincronizado development environment" \
    || echo "Security group may already exist"

# Add rules
aws ec2 authorize-security-group-ingress \
    --group-name sincronizado-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    || true

aws ec2 authorize-security-group-ingress \
    --group-name sincronizado-sg \
    --protocol tcp \
    --port 2222 \
    --cidr 0.0.0.0/0 \
    || true

aws ec2 authorize-security-ingroup-ingress \
    --group-name sincronizado-sg \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0 \
    || true

echo "Security group configured: sincronizado-sg"
echo ""
echo "Next steps:"
echo "  1. Launch Ubuntu 20.04+ EC2 instance with sincronizado-sg"
echo "  2. Note the instance IP address"
echo "  3. SSH into the instance"
echo "  4. Run: curl -fsSL https://raw.githubusercontent.com/microck/sincronizado/main/scripts/setup-vps.sh | sudo bash"
echo ""
