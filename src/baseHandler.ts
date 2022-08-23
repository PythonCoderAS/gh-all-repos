import { Octokit } from "@octokit/rest";
import getToken from "@pythoncoderas/get-github-token";
import { BaseOptions, Repo } from "./types";

export default abstract class BaseHandler<T extends BaseOptions, RT = Repo[]> {
  octokit: Octokit | null = null;

  private makeOctokit(options: T) {
    this.octokit = new Octokit({
      auth: getToken(options.token),
      userAgent: "gh-all-repos",
    });
  }

  public abstract getRepoList(user: string, options: T): Promise<RT>;

  protected async getRepoListToRepoArray(user: string, options: T): Promise<Repo[]> {
    const mode = options.collaborator ? "all" : "owner";
    const includePrivate = options.private ?? false;
    const repoData = await this.octokit!.paginate(
      this.octokit!.repos.listForUser,
      {
        username: user,
        // eslint-disable-next-line camelcase -- Octokit API
        per_page: 100,
        type: mode,
      }
    );
    return repoData
      .filter((repo) => includePrivate || !repo.private)
      .map((repo) => ({
        owner: repo.owner.login,
        name: repo.name,
      })).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  public abstract processList(options: T, repos: RT): Promise<unknown>;

  public abstract preFinish(repos: RT): Promise<unknown>;
  public abstract postFinish(repos: RT): Promise<unknown>;

  public async handle(user: string, options: T): Promise<unknown> {
    this.makeOctokit(options);
    const repos = await this.getRepoList(user, options);
    await this.preFinish(repos);
    await this.processList(options, repos);
    return this.postFinish(repos);
  }

  public getHandler(): (user: string, options: T) => Promise<unknown> {
    return this.handle.bind(this);
  }
}
