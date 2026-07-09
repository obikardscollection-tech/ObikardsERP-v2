const { createReception } = require("./createReceptionService");
const { getReceptions } = require("./getReceptionsService");
const { getReceptionById } = require("./getReceptionByIdService");
const { getPurchaseReceptions } = require("./getPurchaseReceptionsService");
const { updateReception } = require("./updateReceptionService");
const { deleteReception } = require("./deleteReceptionService");
const { autoCreateReception } = require("./autoCreateReceptionService");

module.exports = {
  createReception,
  getReceptions,
  getReceptionById,
  getPurchaseReceptions,
  updateReception,
  deleteReception,
  autoCreateReception,
};
