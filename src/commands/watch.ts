import cli from "../cli";
import { BaseOptions, Repo } from "../types";
import BaseHandler from "../baseHandler";

export default class WatchRepos extends BaseHandler<BaseOptions> {
  extraParams: { subscribed?: boolean; ignored?: boolean };

  names: {
    pre: string;
    post: string;
  };

  constructor(
    extraParams: { subscribed?: boolean; ignored?: boolean },
    names: {
      pre: string;
      post: string;
    }
  ) {
    super();
    this.extraParams = extraParams;
    this.names = names;
  }

  async watchRepo(repo: Repo): Promise<void> {
    await this.octokit!.activity.setRepoSubscription({
      owner: repo.owner,
      repo: repo.name,
      ...this.extraParams,
    });
  }

  async processList(options: BaseOptions, repos: Repo[]): Promise<unknown> {
    return Promise.all(repos.map((repo) => this.watchRepo(repo)));
  }

  preFinish(repos: Repo[]): Promise<unknown> {
    console.log(`${this.names.pre} ${repos.length} repos.`);
    return Promise.resolve();
  }

  postFinish(repos: Repo[]): Promise<unknown> {
    console.log(`${this.names.post} ${repos.length} repos.`);
    return Promise.resolve();
  }

  getRepoList(user: string, options: BaseOptions): Promise<Repo[]> {
    return this.getRepoListToRepoArray(user, options);
  }
}
cli
  .command("watch <user>", "Watch all repositories under a user/org.")
  .action(
    new WatchRepos(
      { subscribed: true },
      { pre: "Watching", post: "Watched" }
    ).getHandler()
  );
