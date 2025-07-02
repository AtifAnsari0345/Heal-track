const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

// Get all medicines
exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.status(200).json({
            success: true,
            data: medicines
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Search medicines
exports.searchMedicines = async (req, res) => {
    try {
        const { query } = req.query;
        const medicines = await Medicine.find({
            name: { $regex: query, $options: 'i' }
        });
        res.status(200).json({
            success: true,
            data: medicines
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Place order
exports.placeOrder = async (req, res) => {
    try {
        const { medicineId, quantity = 1 } = req.body;
        const medicine = await Medicine.findById(medicineId);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found'
            });
        }

        if (medicine.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            medicine: medicineId,
            quantity
        });

        // Update stock
        medicine.stock -= quantity;
        await medicine.save();

        res.status(201).json({
            success: true,
            data: order,
            message: `${medicine.name} has been added to your orders.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};