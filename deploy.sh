#!/bin/bash

# Abdullah Dental Care - Complete Deployment Script
# This script will help you deploy the ADC system to Git and Vercel

echo "============================================="
echo "Abdullah Dental Care - Deployment Script"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Installing Dependencies${NC}"
echo "Running npm install..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Building the Project${NC}"
echo "Running npm run build..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please fix errors and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo -e "${BLUE}Step 3: Git Initialization${NC}"
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Complete ADC System v2.0"
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo "Git repository already exists"
    echo "Adding all changes..."
    git add .
    git commit -m "Update: ADC System $(date +%Y-%m-%d)"
    echo -e "${GREEN}✓ Changes committed${NC}"
fi
echo ""

echo -e "${BLUE}Step 4: GitHub Setup${NC}"
echo "Do you want to push to GitHub? (y/n)"
read -r push_github

if [ "$push_github" = "y" ]; then
    echo "Enter your GitHub repository URL (e.g., https://github.com/yourusername/adc-app.git):"
    read -r github_url
    
    if [ ! -z "$github_url" ]; then
        # Check if remote already exists
        if git remote | grep -q origin; then
            echo "Updating remote origin..."
            git remote set-url origin "$github_url"
        else
            echo "Adding remote origin..."
            git remote add origin "$github_url"
        fi
        
        echo "Pushing to GitHub..."
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Pushed to GitHub successfully${NC}"
        else
            echo -e "${RED}Failed to push to GitHub. Please check your credentials and try manually.${NC}"
        fi
    fi
fi
echo ""

echo -e "${BLUE}Step 5: Vercel Deployment${NC}"
echo "Do you want to deploy to Vercel? (y/n)"
read -r deploy_vercel

if [ "$deploy_vercel" = "y" ]; then
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    echo "Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Deployed to Vercel successfully${NC}"
    else
        echo -e "${RED}Deployment failed. You can deploy manually by running: vercel --prod${NC}"
    fi
fi
echo ""

echo "============================================="
echo -e "${GREEN}Deployment Process Complete!${NC}"
echo "============================================="
echo ""
echo "Your ADC System is now ready to use."
echo ""
echo "Local development: npm run dev"
echo "Production build: npm run build && npm start"
echo ""
echo "For any issues, check:"
echo "- README.md for documentation"
echo "- https://nextjs.org/docs for Next.js help"
echo "- https://vercel.com/docs for Vercel help"
echo ""
