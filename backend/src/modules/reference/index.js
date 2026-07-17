const cardReferenceController = require("./controller/cardReferenceController");
const cardReferenceService = require("./services/cardReferenceService");
const cardReferenceRepository = require("./repositories/cardReferenceRepository");
const cardReferenceMapper = require("./mappers/cardReferenceMapper");
const cardReferenceRoutes = require("./routes/cardReferenceRoutes");

module.exports = {
  cardReferenceController,
  cardReferenceService,
  cardReferenceRepository,
  cardReferenceMapper,
  cardReferenceRoutes,
};
