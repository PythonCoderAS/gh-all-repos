import chalk from "chalk";
import capitalize from "lodash.capitalize";

import BaseHandler from "../baseHandler";
import cli from "../cli";
import { BaseOptions, Repo } from "../types";

interface ListPrOptions extends BaseOptions {
  open?: boolean;
  closed?: boolean;
  all?: boolean;
  author?: string;
  label?: string;
  "repo-limit": string;
}

interface Pr {
  state: string;
  number: number;
  title: string;
  author: string;
  labels: string[];
}

class ListPr extends BaseHandler<ListPrOptions> {
  postFinish(): Promise<unknown> {
    return Promise.resolve();
  }

  preFinish(repos: Repo[]): Promise<unknown> {
    console.log(
      `Listing PRs from ${repos.length} repositories. This may take a while.`
    );
    return Promise.resolve();
  }

  getRepoList(user: string, options: ListPrOptions): Promise<Repo[]> {
    return this.getRepoListToRepoArray(user, options);
  }

  private printHeading(options: ListPrOptions, repo: Repo, prs: Pr[]) {
    let heading = chalk.bold(`${repo.owner}/${repo.name}`);
    const repoLimit = parseInt(options["repo-limit"], 10);
    let displayablePRs = prs.length;
    if (repoLimit && displayablePRs > repoLimit) {
      displayablePRs = repoLimit;
    }

    heading +=
      displayablePRs === prs.length
        ? ` (${prs.length})`
        : ` (${displayablePRs}/${prs.length})`;
    console.log(chalk.underline(heading));
  }

  printPR(repo: Repo, pr: Pr) {
    const outputString = `[${capitalize(pr.state)}] https://github.com/${
      repo.owner
    }/${repo.name}/pull/${pr.number}: ${pr.title}`;
    console.log(outputString);
  }

  async processRepo(options: ListPrOptions, repo: Repo) {
    let state: "all" | "closed" | "open" = "open";
    if (options.all) {
      state = "all";
    } else if (options.closed) {
      state = "closed";
    }

    let prs: Pr[] = (
      await this.octokit!.paginate(this.octokit!.pulls.list, {
        owner: repo.owner,
        repo: repo.name,
        // eslint-disable-next-line camelcase -- Octokit API
        per_page: 100,
        state,
        direction: "asc",
      })
    ).map((pr) => ({
      state: pr.state,
      number: pr.number,
      title: pr.title,
      labels: pr.labels.map((label) => label.name),
      author: (pr.user || {}).name ?? "",
    }));
    if (options.author) {
      prs = prs.filter((pr) => pr.author === options.author);
    }

    if (typeof options.label === "string") {
      prs = prs.filter((pr) => pr.labels.includes(options.label as string));
    }

    if (prs.length === 0) {
      return;
    }

    this.printHeading(options, repo, prs);
    const repoLimit = parseInt(options["repo-limit"], 10);
    if (repoLimit > 0) {
      prs = prs.filter((_, index: number) => index < repoLimit);
    }

    for (const pr of prs) {
      this.printPR(repo, pr);
    }

    console.log();
  }

  async processList(options: ListPrOptions, repos: Repo[]) {
    for (const repo of repos) {
      // eslint-disable-next-line no-await-in-loop
      await this.processRepo(options, repo);
    }
  }
}

cli
  .command(
    "list-pr <user>",
    "List all pull requests under a user/organization."
  )
  .option("-o, --open", "List open pull requests (default).")
  .option("-c, --closed", "List closed pull requests.")
  .option("-a, --all", "List all pull requests.")
  .option("--author", "List pull requests by the given author.")
  .option("--label", "List pull requests with the given label.")
  .option(
    "--repo-limit",
    "Limit the number of pull requests that can be shown by repository.",
    "0"
  )
  .action(new ListPr().getHandler());
