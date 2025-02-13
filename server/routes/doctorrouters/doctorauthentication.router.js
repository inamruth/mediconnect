const doctorModel = require('../../models/doctor/doctor.model')
// const cors = require('cors');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const router = express.Router();

router.use(express.json());

router.use(session({
    secret: 'hospital-token',
    resave: false,
    saveUninitialized: true
}));

router.post('/signup', async (req, res) => {
    const { name, email, password, age, mobile, gender, specialization } = req.body;
    try {
        const hash = await bcrypt.hash(password, 12);
        await doctorModel.create({ name, email, password: hash, age, gender, mobile, specialization })
            .then(user => res.json({ success: true }))
            .catch(err => res.json(err))
    } catch (err) {
        console.error('Signup error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const doctor = await doctorModel.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ error: 'No record exists' });
        }
        const isPassowrdValid = await bcrypt.compare(password, doctor.password);
        if (!isPassowrdValid) {
            return res.status(401).json({ error: 'The password is incorrect' });
        }
        const token = jwt.sign({ email: doctor.email }, "jwt-secret-key", { expiresIn: '1h' });
        return res.status(200).json({ status: 'Success', token, doctor });
    } catch (err) {
        console.log('Login error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;