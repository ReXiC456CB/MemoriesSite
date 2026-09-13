# Install common MCP tools once Node/npm are available
# Run this in PowerShell from the project root

npx -y @modelcontextprotocol/server-filesystem .
npx -y @playwright/mcp@latest
npx -y @modelcontextprotocol/server-github
npx -y @upstash/context7-mcp@latest
npx -y @modelcontextprotocol/server-sequential-thinking
npx -y figma-developer-mcp

Write-Host "If any package requires a token or API key, set env vars before rerunning."
Write-Host "Example: $env:GITHUB_TOKEN = '...'; $env:FIGMA_API_KEY = '...'"
