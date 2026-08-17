import { seedShowcaseData } from "../src/server/showcase-seed";

const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
if (!usingEmulator && process.env.ALLOW_REMOTE_SEED !== "true") {
  throw new Error("Showcase seed is emulator-only by default. Set ALLOW_REMOTE_SEED=true explicitly for a remote project.");
}

seedShowcaseData()
  .then((result) => console.info("LateTap showcase seed complete", result))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
