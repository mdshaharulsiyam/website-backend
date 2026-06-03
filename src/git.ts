import fs from "fs"
import path from "path"

// Adjusting the directory path to avoid "src" and point directly to the root of your project
const _dirname = path.join(__dirname, "../.github/workflows")

if (!fs.existsSync(_dirname)) {
  fs.mkdirSync(_dirname, { recursive: true })
}

const test_file = "test.yml"
const deploy_file = "deploy.yml"

if (!fs.existsSync(path.join(_dirname, test_file))) {
  fs.writeFileSync(path.join(_dirname, test_file), `
    name: Run Tests
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: node:22
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: npm clean install
        run: npm ci
      - name: Install Dependencies
        run: npm install

      - name: Building app
        run: npm run build

    `)
}

if (!fs.existsSync(path.join(_dirname, deploy_file))) {
  fs.writeFileSync(path.join(_dirname, deploy_file), `
  name: Deploy Node.js with TypeScript on EC2

on:
  push:
    branches:
      - "main"
  pull_request:
    branches:
      - "main"

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20.15"
      - name: Install Dependencies
        run: npm install --frozen-lockfile
      - name: Install TypeScript Compiler
        run: npm install -g typescript
      - name: Build Project
        run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20.15"
      - name: Install Dependencies
        run: npm install --frozen-lockfile
      - name: Build Project
        run: npm run build
      - name: Configure SSH
        env:
          SSH_PRIVATE_KEY: {{ secrets.SERVER_SSH_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H {{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy Server
        env:
          EC2_HOST:{{ secrets.SERVER_HOST }}
          EC2_USER: {{ secrets.SERVER_USER }}
          ENV_VARS_JSON: {{ secrets.ENV_VARS_JSON }}
        run: |
          # Create application directories on EC2 if they don't exist
          ssh $EC2_USER@$EC2_HOST "mkdir -p ~/applications/backend"

          # Copy the backend project to EC2 using rsync
          rsync -avz \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='.github' \
            . $EC2_USER@$EC2_HOST:~/applications/backend/  # Deploy only the backend files

          # Install production dependencies on EC2 for the backend
          ssh $EC2_USER@$EC2_HOST "cd ~/applications/backend && npm install --frozen-lockfile --production"

          # Set the environment variables (using the ENV_VARS_JSON secret)
          ssh $EC2_USER@$EC2_HOST "echo '$ENV_VARS_JSON' > ~/applications/backend/.env"

          # Stop the existing PM2 process if it exists
          ssh $EC2_USER@$EC2_HOST "pm2 delete backend || true"  # Ensures no errors if the process doesn't exist

          # Start the backend application with PM2
          ssh $EC2_USER@$EC2_HOST "cd ~/applications/backend && pm2 start dist/index.js --name backend"

    `)
}
