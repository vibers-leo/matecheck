
# MCP Server Configuration Guide for VS Code
Source: https://code.visualstudio.com/docs/copilot/customization/mcp-servers

This document serves as a reference for configuring Model Context Protocol (MCP) servers in VS Code, enabling the AI model to access external tools and data.

## 1. What are MCP Servers?
MCP servers act as bridges between the AI model and external systems (databases, APIs, file systems).
- **Client**: VS Code (requests actions)
- **Server**: Provides tools (execution logic)
- **Protocol**: Standardized JSON-RPC based communication

## 2. Setting Up an MCP Server
You can configure MCP servers in two scopes:
- **Global**: User Profile (`mcp.json`) - Applies to all projects.
- **Project**: Workspace (`.vscode/mcp.json`) - Applies only to the current project.

### Configuration File Structure (`.vscode/mcp.json`)
```json
{
  "servers": {
    "my-server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "type": "stdio"
    }
  }
}
```

## 3. Configuration Formats
### A. Local Process (stdio) - Most Common
Runs a local command (Node, Python, Docker) and communicates via Standard I/O.
```json
"servers": {
  "local-tool": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "my-mcp-server"],
    "env": {
      "API_KEY": "${input:my-api-key}"
    }
  }
}
```

### B. Remote Server (HTTP / SSE)
Connects to a running server instance over HTTP/HTTPS.
```json
"servers": {
  "remote-tool": {
    "type": "http",
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer ${input:api-token}"
    }
  }
}
```

## 4. Handling Sensitive Data (Input Variables)
Never hardcode secrets. Use `inputs` to prompt the user securely.
```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github-token",
      "description": "Enter your GitHub Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${input:github-token}"
      }
    }
  }
}
```

## 5. Debugging
- Use the **Output** panel in VS Code and select "MCP Server" to see logs.
- Ensure Docker containers run in foreground mode (no `-d` flag).
