import { platform, arch } from "os";
import { dirname } from "path";
import { chmod, mkdir, rename } from "fs/promises";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { mapOS, mapArch, download, extract } from "./utils";

export async function setupchartmuseum() {
  try {
    const version = core.getInput("chartmuseum-version");

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
  } catch (e) {
    core.error(e as Error);
    throw e;
  }
}
