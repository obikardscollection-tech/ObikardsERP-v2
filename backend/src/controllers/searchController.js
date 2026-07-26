const searchService = require("../services/search");

async function search(req, res) {
  try {
    const payload = await searchService.searchGlobalEntities(req.query.q, {
      limitPerCategory: req.query.limitPerCategory,
    });

    return res.json(payload);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  search,
};
