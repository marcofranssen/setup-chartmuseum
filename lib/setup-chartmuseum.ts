import { platform, arch } from "os";
import { dirname } from "path";
import { chmod, mkdir, rename } from "fs/promises";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { mapOS, mapArch, download } from "./utils";

export async function setupchartmuseum() {
  try {
    const chartmuseumVersion = core.getInput("chartmuseumVersion");

    core.debug(`Installing chartmuseum ${chartmuseumVersion}…`);

    const osPlatform = platform();
    const osArch = arch();
    const p = mapOS(osPlatform);
    const a = mapArch(osArch);

    const downloadURL = `https://get.helm.sh/chartmuseum-${chartmuseumVersion}-${p}-${a}.tar.gz`;
    const checksumURL = `${downloadURL}.sha256sum`;

    let cachedPath = tc.find("chartmuseum", chartmuseumVersion, osArch);

    if (cachedPath) {
      core.info(
        `Found chartmuseum ${chartmuseumVersion} in toolcache @ ${cachedPath}`
      );
    } else {
      core.info(`Attempting to download chartmuseum ${chartmuseumVersion}…`);
      const pathToCLI = await download(downloadURL, checksumURL);
      const dir = `${dirname(pathToCLI)}/chartmuseum-${chartmuseumVersion}`;
      await mkdir(dir, { recursive: true });
      await rename(pathToCLI, `${dir}/chartmuseum`);
      await chmod(`${dir}/chartmuseum`, 0o755);
      cachedPath = await tc.cacheDir(
        `${dir}`,
        "chartmuseum",
        chartmuseumVersion,
        osArch
      );
    }

    core.addPath(cachedPath);
    core.setOutput("chartmuseum-version", chartmuseumVersion);
  } catch (e) {
    core.error(e as Error);
    throw e;
  }
}
