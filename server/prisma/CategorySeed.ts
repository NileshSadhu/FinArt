import {
  ensureSeedCategories,
  ensureSeedUser,
  runSeed,
} from "./seedHelpers.js";

async function main() {
  const user = await ensureSeedUser();
  const categories = await ensureSeedCategories(user.id);
  console.log(`Seeded ${categories.size} categories for ${user.email}.`);
}

void runSeed("Category", main);
