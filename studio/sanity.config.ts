import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { media } from "sanity-plugin-media";
import { requireStudioDataset } from "./environment";
import { schemaTypes } from "./schema-types";
import { resolve } from "./presentation/resolve";
import { structure } from "./structure";
import { defaultDocumentNode } from "./defaultDocumentNode";
import { codeInput } from "@sanity/code-input";

// Define the actions that should be available for singleton documents
const singletonActions = new Set([
  "publish",
  "discardChanges",
  "restore",
  "unpublish",
]);

// Define the singleton document types
const singletonTypes = new Set(["settings", "navigation"]);
const nonCreatableTypes = singletonTypes;

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "your-project-id";
const dataset = requireStudioDataset(process.env.SANITY_STUDIO_DATASET);
const apiVersion = process.env.SANITY_STUDIO_API_VERSION || "2026-03-23";

const SANITY_STUDIO_PREVIEW_URL =
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

export default defineConfig({
  title: "Schema UI: Starter",
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schema' folder
  schema: {
    types: schemaTypes,
    // Filter singletons and read-only compatibility types from global creation.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !nonCreatableTypes.has(schemaType)),
  },
  document: {
    // For singleton types, filter out actions that are not explicitly included
    // in the `singletonActions` list defined above
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
  plugins: [
    structureTool({ structure, defaultDocumentNode }),
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve,
    }),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
    media(),
  ],
});
