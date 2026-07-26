const { createReception } = require("./createReceptionService");
const { getReceptions } = require("./getReceptionsService");
const { searchReceptions } = require("./searchReceptionsService");
const { getReceptionById } = require("./getReceptionByIdService");
const { getPurchaseReceptions } = require("./getPurchaseReceptionsService");
const { updateReception } = require("./updateReceptionService");
const { deleteReception } = require("./deleteReceptionService");
const { autoCreateReception } = require("./autoCreateReceptionService");

module.exports = {
  createReception,
  getReceptions,
  searchReceptions,
  getReceptionById,
  getPurchaseReceptions,
  updateReception,
  deleteReception,
  autoCreateReception,
};
