const suppliersService = require("../services/suppliers");

async function create(req, res) {
  try {
    const supplier = await suppliersService.createSupplier(req.body);

    return res.status(201).json(supplier);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const suppliers = await suppliersService.getSuppliers();

    return res.json(suppliers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const supplier = await suppliersService.getSupplierById(req.params.id);

    return res.json(supplier);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const supplier = await suppliersService.updateSupplier(
      req.params.id,
      req.body
    );

    return res.json(supplier);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const result = await suppliersService.deleteSupplier(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message,
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};