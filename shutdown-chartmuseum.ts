import * as core from "@actions/core";
import find from "find-process";
import { sleep } from "./lib/utils";

shutdown().catch((e) => core.setFailed(e.message));

async function shutdown() {
  const bootup = core.getBooleanInput("bootup");

  if (!bootup) {
    core.debug("bootup was disabled");
    return Promise.resolve();
  }

  core.debug(`Start shutting down chartmuseum`);
  await shutdownChartmuseum();
  core.debug(`Finished shutting down chartmuseum`);

  return Promise.resolve();
}

async function shutdownChartmuseum(): Promise<void> {
  const pList = await find("name", "chartmuseum", true);
  if (pList.length == 0) {
    return Promise.resolve();
  }

  core.debug("shutting down chartmuseum…");
  const iamlive = pList[0];
  core.debug(`pid: ${iamlive.pid}, name: ${iamlive.name}`);
  process.kill(pList[0].pid, "SIGTERM");
  await sleep(1000);
  await shutdownChartmuseum();
}
