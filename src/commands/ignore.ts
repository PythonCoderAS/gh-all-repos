import cli from "../cli";
import WatchRepos from "./watch";

cli
  .command("ignore <user>", "Ignore all repositories under a user/org.")
  .action(
    new WatchRepos(
      { ignored: true },
      { pre: "Ignoring", post: "Ignored" }
    ).getHandler()
  );
