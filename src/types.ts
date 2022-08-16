export interface BaseOptions {
  _: string[];
  token?: string;
  collaborator?: boolean;
  private?: boolean;
}

export interface Repo {
  owner: string;
  name: string;
}
