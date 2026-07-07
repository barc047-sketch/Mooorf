# Claude Code MCP Setup Commands

Run from the lab project root.

## Minimum

```powershell
claude mcp add zonuert-files -- npx -y @modelcontextprotocol/server-filesystem "%cd%"
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch
claude mcp add playwright -- npx @playwright/mcp@latest
npx ctx7 setup --claude
```

## Optional but useful

```powershell
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

## 21st.dev Magic MCP

```powershell
npx @21st-dev/cli@latest install claude --api-key YOUR_21ST_DEV_API_KEY
```

## Serena

```powershell
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "%cd%"
```

## Claude Context

```powershell
claude mcp add claude-context -- npx @zilliz/claude-context-mcp@latest
```

## Recommended active MCP set

Start with:

```text
filesystem
memory
fetch
Context7
Playwright
```

Add later only if repo grows:

```text
Serena
Claude Context
21st.dev Magic
```
