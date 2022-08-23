import { expect } from "chai";

import { runCommandWithArgs, runCommandWithArgsAndOutput } from "../index";

describe("list-pr tests", () => {
  it("should not run with no arguments", () =>
    expect(runCommandWithArgs(["list-pr"])).to.eventually.equal(false));
  it("runs with PythonCoderAS user", () =>
    expect(runCommandWithArgsAndOutput(["list-pr", "PythonCoderAS"]))
      .to.eventually.have.property("stdout")
      .which.contain(
        "[Open] https://github.com/PythonCoderAS/GithubAPIIntegrationTest/pull/1: Github API PR Test 1"
      )
      .and.to.eventually.not.have.property("stderr"));
});
