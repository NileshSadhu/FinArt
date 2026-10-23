import {
  ensureSeedUser,
  runSeed,
} from "./seedHelpers.js";

async function main() {
  const user = await ensureSeedUser();
  console.log(`Using existing Google user ${user.email} (${user.id}).`);
}

void runSeed("User", main);
