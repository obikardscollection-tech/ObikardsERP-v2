require("dotenv").config();

const {
  validateSportsCardsProApi,
} = require("../modules/market/sportscardspro/sportsCardsProApiValidation");

const INTERNALS = {
  SEARCH_QUERY: "Michael Jordan",
};

async function main() {
  try {
    await validateSportsCardsProApi(INTERNALS.SEARCH_QUERY);

    console.log("");
    console.log("========== VALIDATION TERMINEE ==========");
  } catch (error) {
    console.error("");
    console.error("========== VALIDATION ECHOUEE ==========");

    if (error instanceof Error) {
      console.error(error.message);
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  }
}

main();