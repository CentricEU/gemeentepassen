# Specify base image and working directory
FROM mcr.microsoft.com/playwright:v1.44.1-focal

# Copy the rest of the application files
COPY . ./app

# Create a working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Run Playwright tests
RUN npx playwright test --reporter=list