const searchService = require("../services/search");

async function search(req, res, next) {
  try {
    const payload = await searchService.searchGlobalEntities(req.query.q, {
      limitPerCategory: req.query.limitPerCategory,
    });

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  search,
};
