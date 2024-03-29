import sade from "sade";

const { version, description } = require("../package.json");

const cli = sade("gh-all-repos")
  .version(version)
  .describe(description)
  .option("-t, --token", "The GitHub Personal Access Token (PAT) to use.")
  .option(
    "--collaborator",
    "Include repositories that the user is a collaborator on (only usable if the specified user is the authenticated user).",
    false
  )
  .option("-p, --private", "Include private repositories.", false);

export default cli;
