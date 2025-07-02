const Appointment = require('../models/Appointment');

// Change to module.exports
module.exports = {
    getMyAppointments: async (req, res) => {
        try {
            const appointments = await Appointment.find({ user: req.user.id })
                .sort({ appointmentDate: 1, appointmentTime: 1 });

            res.status(200).json({
                success: true,
                data: appointments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    createAppointment: async (req, res) => {
        try {
            const appointmentData = {
                user: req.user.id,
                doctorName: req.body.doctorName,
                specialization: req.body.specialization,
                hospitalName: req.body.hospitalName,
                hospitalId: req.body.hospitalId,
                appointmentDate: req.body.appointmentDate,
                appointmentTime: req.body.appointmentTime,
                notes: req.body.notes
            };

            const appointment = await Appointment.create(appointmentData);

            res.status(201).json({
                success: true,
                data: appointment,
                message: 'Appointment scheduled successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};