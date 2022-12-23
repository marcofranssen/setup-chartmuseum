import { createHash } from "crypto";
import { readFile } from "fs/promises";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import fetch, { RequestInfo } from "node-fetch";

export function mapOS(os: string): string {
  const mappings: Record<string, string> = {
    win32: "windows",
  };
  return mappings[os] || os;
}

export function mapArch(arch: string): string {
  const mappings: Record<string, string> = {
    x32: "386",
    x64: "amd64",
  };
  return mappings[arch] || arch;
}

export async function download(url: string, checksumURL: RequestInfo) {
  const pathToCMTar = await tc.downloadTool(url);
  if (!pathToCMTar) {
    throw new Error(`Unable to download tool from ${url}`);
  }

  const response = await fetch(checksumURL);

  if (response.status != 200) {
    response.headers.forEach((v, k) => core.debug(`${k}: ${v}`));
    core.debug(`${response.status}: ${response.statusText}`);
    core.debug(await response.text());
    throw new Error(`Unable to download checksum from ${checksumURL}`);
  }

  const checksum = (await response.text()).trim().split(" ")[0];

  const fileBuffer = await readFile(pathToCMTar);
  const hash = createHash("sha256");
  hash.update(fileBuffer);

  const hex = hash.digest("hex");
  if (hex !== checksum) {
    throw new Error(
      `Checksum does not match, expected ${checksum}, got ${hex}`
    );
  }

  core.debug(`Checksums matched: ${checksum}`);

  return pathToCMTar;
}

export function extract(pathToCMTar: string) {
  return process.platform === "win32"
    ? tc.extractZip(pathToCMTar)
    : tc.extractTar(pathToCMTar);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
