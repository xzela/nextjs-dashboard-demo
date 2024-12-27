import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';


import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'dashboard'
});

async function seedUsers() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT(11) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL
    );`
  );

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return connection.query(`
        INSERT INTO users (id, name, email, password)
        VALUES ("${user.id}", "${user.name}", "${user.email}", "${hashedPassword}");
      `);
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  // await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await connection.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT(11) PRIMARY KEY AUTO_INCREMENT,
      customer_id INT(11) NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => connection.query(`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES ("${invoice.customer_id}", "${invoice.amount}", "${invoice.status}", "${invoice.date}");
      `),
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT(11) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => connection.query(`
        INSERT INTO customers (id, name, email, image_url)
        VALUES ("${customer.id}", "${customer.name}", "${customer.email}", "${customer.image_url}");
      `),
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => connection.query(`
        INSERT INTO revenue (month, revenue)
        VALUES ("${rev.month}", "${rev.revenue}");
      `),
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
  //   await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
  //   await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
