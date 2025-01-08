import arg from "arg";

const args = arg({});

const command = args._[0];

if (!command) {
  console.error("Usage: gen <command> [options]");
  process.exit(1);
}

switch (command) {
  case "download":
    import("../download").then((m) => m.default());
    break;
  case "generate":
    if (!args._[1]) {
      console.error("Usage: gen translate <lang>");
      process.exit(1);
    }
    import("../generate").then((m) => m.default(args._[1]));
    break;
  case "translate":
    if (!args._[1]) {
      console.error("Usage: gen translate <lang>");
      process.exit(1);
    }
    import("../translate").then((m) => m.default(args._[1]));
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
