#!/usr/bin/env node

import program from "commander";

import { startServer } from "./app";

program.command("start")
  .option("-p, --path <path>", "Path of the application's directory.")
  .action((program) => {
    startServer(program.path);
  });

program.parse(process.argv)
