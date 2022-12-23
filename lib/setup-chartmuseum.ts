import { platform, arch } from "os";
import { dirname } from "path";
import { chmod, mkdir, rename } from "fs/promises";
import { spawn } from "child_process";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { mapOS, mapArch, download, extract, sleep } from "./utils";

export async function setupchartmuseum() {
  try {
    const version = core.getInput("chartmuseum-version");
    const bootup = core.getBooleanInput("bootup");
    const port = parseInt(core.getInput("port"));

    core.debug(`Installing chartmuseum ${version}…`);

    const osPlatform = platform();
    const osArch = arch();
    const p = mapOS(osPlatform);
    const a = mapArch(osArch);

    const downloadURL = `https://get.helm.sh/chartmuseum-${version}-${p}-${a}.tar.gz`;
    const checksumURL = `${downloadURL}.sha256sum`;

    let cachedPath = tc.find("chartmuseum", version, osArch);

    if (cachedPath) {
      core.info(`Found chartmuseum ${version} in toolcache @ ${cachedPath}`);
    } else {
      core.info(`Attempting to download chartmuseum ${version}…`);
      const pathToTar = await download(downloadURL, checksumURL);
      const archiveContents = await extract(pathToTar);

      const dir = `${dirname(archiveContents)}/chartmuseum-${version}`;
      await mkdir(dir, { recursive: true });
      await rename(
        `${archiveContents}/${p}-${a}/chartmuseum`,
        `${dir}/chartmuseum`
      );
      await chmod(`${dir}/chartmuseum`, 0o755);
      cachedPath = await tc.cacheDir(`${dir}`, "chartmuseum", version, osArch);
    }

    core.addPath(cachedPath);
    core.setOutput("chartmuseum-version", version);

    if (bootup) {
      await runChartmuseum(port);
      core.setOutput("chartmuseum-port", port);
      core.setOutput("chartmuseum-endpoint", `http://127.0.0.1:${port}`);
    }
  } catch (e) {
    core.error(e as Error);
    throw e;
  }
}

async function runChartmuseum(port: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const cmd = "chartmuseum";
    const args = [
      "--debug",
      "--port",
      port.toString(),
      "--storage",
      "local",
      "--storage-local-rootdir",
      "./chartmuseum",
    ];
    core.info(`${cmd} ${args.join(" ")}`);
    const cm = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
    });
    cm.once("spawn", () => {
      const ps = spawn("ps", ["aux", "|", "grep", "chartmuseum"]);
      ps.stdout.on("data", (data) => core.debug(data));

      core.info(`chartmuseum booted at ${port}`);
      sleep(500);
      resolve();
    });
    cm.once("error", (code) => {
      core.info(`Exited: ${code}`);
      reject(code);
    });
    cm.unref();
  });
}
