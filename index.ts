import { setFailed } from "@actions/core";
import { setupchartmuseum } from "./lib/setup-chartmuseum";

setupchartmuseum().catch((e) => setFailed(e.message));
