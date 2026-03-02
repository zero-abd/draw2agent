# draw2agent ✏️

[![mcp-registry](https://img.shields.io/badge/mcp--registry-io.github.zero--abd%2Fdraw2agent%401.3.4-blue)](https://registry.modelcontextprotocol.io/?q=draw2agent)

Draw on your website. Your AI agent sees it.

**draw2agent** is an MCP server that lets you draw annotations directly on top of your local dev page. When you submit, your IDE agent receives a screenshot, structured DOM data, and annotation context to make precise code edits.

👉 **Try it out at:** [draw2agent.vercel.app](https://draw2agent.vercel.app)

## Demo

[![draw2agent demo video](https://img.youtube.com/vi/siv1ioOnOXk/maxresdefault.jpg)](https://youtu.be/siv1ioOnOXk)

## Quick Start

### 1. Add to your IDE (one-time)

**Cursor** (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "draw2agent": {
      "command": "npx",
      "args": ["-y", "draw2agent"]
    }
  }
}
```

### 2. Use it

Tell your agent:
> "Use draw2agent to fix the navbar"

1. 🌐 Agent opens your browser with drawing tools on your page
2. ✏️ Draw circles, arrows, text directly on your website
3. 📸 Click **Submit**
4. 🤖 Agent reads the visual context and applies code changes

## How It Works

```
Your Dev Page (proxied)
├── Your original page content
└── Excalidraw overlay (transparent, on top)
    ├── Draw mode: annotate directly on the page
    ├── Select mode: interact with the page normally (Esc)
    └── Submit: screenshot + DOM + annotations → agent
```

The MCP server exposes two tools:

| Tool | Description |
|---|---|
| `launch_canvas` | Opens your dev page with the drawing overlay |
| `get_drawing_state` | Returns screenshot, DOM nodes, and annotations |

## License

MIT
