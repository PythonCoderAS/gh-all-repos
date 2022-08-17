import { runScript, runScriptOutput } from "subprocess-test-utils";

export async function runCommandWithArgs(args: string[]): Promise<boolean> {
  return runScript("node", ["dist/index.js", ...args]);
}

export async function runCommandWithArgsAndOutput(
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  return runScriptOutput("node", ["dist/index.js", ...args]);
}
