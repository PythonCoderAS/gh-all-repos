import cli from "../cli";
import { BaseOptions, Repo } from "../types";
import BaseHandler from "../baseHandler";

import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import { Octokit } from "@octokit/rest";

const _octokit = new Octokit(); // This is only used for getting the type.

type FullRepoData = GetResponseDataTypeFromEndpointMethod<
  typeof _octokit.repos.listForUser
  >;

interface TrueListOptions {
  /**
   * Whether to include archived repos.
   *
   * `true`: Include archived repos only.
   * `false`: Include unarchived repos only.
   * Not supplying a value includes both.
   */
  archived?: boolean
  /**
   * Whether to include private repos. Same meanings to `true`, `false` and `undefined`.
   */
  private?: boolean
  /**
   * Whether to include forked repos. Same meanings to `true`, `false` and `undefined`.
   */
  fork?: boolean
  /**
   * Whether to include mirrored repos. Same meanings to `true`, `false` and `undefined`.
   */
  mirror?: boolean
  /**
   * Whether to include template repos. Same meanings to `true`, `false` and `undefined`.
   */
  template?: boolean
  /**
   * Programming languages to include. Leaving this `undefined` will include all repositories.
   */
  languages?: string[]
}

/**
 * See {@link TrueListOptions}.
 */
interface ListOptions extends BaseOptions {
  archived?: boolean
  private?: boolean
  fork?: boolean
  mirror?: boolean
  template?: boolean
  languages?: string | string[]
  "show-owner-name"?: boolean
}

class List extends BaseHandler<ListOptions, FullRepoData> {
  postFinish(): Promise<unknown> {
    return Promise.resolve();
  }

  preFinish(): Promise<unknown> {
    return Promise.resolve();
  }

  private transformListOptionstoTrueListOptions(options: ListOptions): TrueListOptions {
    console.log(options)
    const data: TrueListOptions = {};
    if (options.fork !== undefined){
      data.fork = options.fork;
    }
    if (options.private !== undefined){
      data.private = options.private;
    }
    if (options.archived !== undefined){
      data.archived = options.archived;
    }
    if (options.mirror !== undefined){
      data.mirror = options.mirror;
    }
    if (options.template !== undefined){
      data.template = options.template;
    }
    if (typeof options.languages === "string"){
      data.languages = [options.languages]
    } else {
      data.languages = options.languages
    }
    return data;
  }


  async getRepoList(user: string, options: ListOptions): Promise<FullRepoData> {
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
    return repoData.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }

  async processList(options: ListOptions, repos: FullRepoData) {
    const trueOptions = this.transformListOptionstoTrueListOptions(options);
    console.log(trueOptions)
    console.log(repos[0])
    const filteredRepos = repos.filter((repo) => {
      if (trueOptions.archived !== undefined && repo.archived !== trueOptions.archived){
        return false;
      }
      if (trueOptions.private !== undefined && repo.private !== trueOptions.private){
        return false;
      }
      if (trueOptions.fork !== undefined && repo.fork !== trueOptions.fork){
        return false;
      }
      // mirror_url is `null` when there is not a mirror, and vice versa.
      if (trueOptions.mirror !== undefined && (trueOptions.mirror ? (repo.mirror_url === null) : (repo.mirror_url !== null))){
        return false;
      }
      if (trueOptions.template !== undefined && repo.is_template !== trueOptions.template){
        return false;
      }
      if ((trueOptions.languages ?? []).length > 0){
        if (typeof repo.language !== "string"){
          return false;
        }
        if (!trueOptions.languages!.map((language) => language.toLowerCase()).includes(repo.language.toLowerCase())){
          return false;
        }
      }
      return true;
    })
    if (options["show-owner-name"] ?? true) {
      filteredRepos.forEach((repo) => console.log(repo.name))
    } else {
      filteredRepos.forEach((repo) => console.log(`${repo.owner.login}/${repo.name}`))
    }
  }

}

cli.command("list <user>", "List all repositories under an user/organization.")
  .option("--archived", "Filters for only archived repositories.")
  .option("--no-archived", "Filters for only non-archived repositories.")
  .option("--fork", "Filters for only forked repositories.")
  .option("--no-fork", "Filters for only non-forked repositories.")
  .option("--private", "Filters for only private repositories.")
  .option("--no-private", "Filters for only non-private repositories.")
  .option("--mirror", "Filters for only mirrored repositories.")
  .option("--no-mirror", "Filters for only non-mirrored repositories.")
  .option("--template", "Filters for only template repositories.")
  .option("--no-template", "Filters for only non-template repositories.")
  .option("--languages", "Filters for repositories whose primary language is one of the supplied languages.")
  .option("--no-show-owner-name", "Displays repository names only instead of 'owner/repo'.")
  .action(new List().getHandler())

