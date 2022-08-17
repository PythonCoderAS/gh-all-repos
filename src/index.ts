#!/usr/bin/env node

import cli from "./cli";
import "./commands";

cli.parse(process.argv);
