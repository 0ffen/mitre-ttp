#!/usr/bin/env node

"use strict";

var nodeModule = require("module");

if (typeof nodeModule.enableCompileCache === "function") {
  nodeModule.enableCompileCache();
}

var dynamicImport = new Function("module", "return import(module)");
dynamicImport("../dist/index.js");
