export function generateImportPrompt(importUrl: string): string {
  return `You are analyzing a codebase to generate an Atelier project schema.

Atelier is a visual app builder. Analyze this codebase and respond with a JSON object
that describes the app structure. Post the JSON to this URL when done:
${importUrl}

Respond ONLY with valid JSON matching this schema exactly:

{
  "version": "1.0",
  "name": "<project name>",
  "framework": "<vue3|react|svelte|nuxt|angular|agnostic>",
  "shell": {
    "pattern": "<top-only|sidebar-only|top-sidebar|none>",
    "brand": { "appName": "<app name>", "logoType": "icon-text" },
    "sidebarItems": [{ "label": "<label>", "path": "<route path>", "icon": "<icon name>" }],
    "topBarItems": [{ "label": "<label>", "type": "<search|notification|custom>" }]
  },
  "views": [
    {
      "name": "<view name>",
      "rows": [
        {
          "label": "<row label>",
          "components": [
            {
              "type": "<UiStats|UiCard|UiTable|UiForm|UiButton|UiInput>",
              "name": "<component name>",
              "props": {},
              "dataSource": "<model.field or null>"
            }
          ]
        }
      ]
    }
  ],
  "theme": {
    "primary": "<hex color>",
    "background": "<hex color>",
    "surface": "<hex color>",
    "foreground": "<hex color>",
    "radius": 8,
    "font": "<font name>"
  },
  "schemas": [
    {
      "name": "<model name>",
      "fields": [{ "name": "<field>", "type": "<string|number|boolean|date|array>", "description": "<desc>" }]
    }
  ]
}

Analyze the actual routes, components, data models, and navigation structure.
Do not invent structure — only describe what exists in the codebase.`
}
