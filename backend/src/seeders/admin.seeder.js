'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = 'admin@c2c.com';
    const [rows] = await queryInterface.sequelize.query(
      'SELECT 1 FROM `users` WHERE `email` = :email LIMIT 1',
      { replacements: { email } }
    );
    if (Array.isArray(rows) && rows.length > 0) return;

    const hash = await bcrypt.hash('Admin@123', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [{
      name: 'System Admin',
      email,
      password: hash,
      role: 'admin',
      status: true,
      created_at: now,
      updated_at: now
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@c2c.com' }, {});
  }
};
