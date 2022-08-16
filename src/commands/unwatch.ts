import cli from "../cli";
import WatchRepos from "./watch";

cli
  .command("unwatch <user>", "Unwatch all repositories under a user/org.")
  .action(
    new WatchRepos(
      { subscribed: false, ignored: false },
      { pre: "Unwatching", post: "Watching" }
    ).getHandler()
  );
