const db = require('../models');
const User = db.users;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration process
exports.register = async (req, res) => {
  try {
    // Get user information
    const { name, email, password, phone } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: 'This email address is already in use.' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    // Create JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    // Return response
    res.status(201).send({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// User login process
exports.login = async (req, res) => {
  try {
    // Get email and password
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Password check
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid password!' });
    }

    // Create JWT Token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    // Return response
    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
