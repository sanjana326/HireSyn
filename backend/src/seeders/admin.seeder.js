'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = 'admin1@c2c.com';
    const [rows] = await queryInterface.sequelize.query(
      'SELECT 1 FROM `users` WHERE `email` = :email LIMIT 1',
      { replacements: { email } }
    );
    if (Array.isArray(rows) && rows.length > 0) return;

    const hash = await bcrypt.hash('Admin@123', 10);
    const now = new Date();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('users', [{
      name: 'System Admin',
      email,
      password: hash,
      role: 'admin',
      status: true,
      reset_token: resetToken,
      reset_token_expiry: resetTokenExp,
      created_at: now,
      updated_at: now
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin1@c2c.com' }, {});
  }
};
