#!/usr/bin/env node
import { main } from "../src/cli.js";

// Entry: await CLI (needed for async exports)
await main();
