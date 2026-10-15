import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial pharmacy data...');

  // 0. Create default Admin User
  const defaultPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@pharmly.com' },
    update: {},
    create: {
      name: 'James Bond',
      email: 'admin@pharmly.com',
      password: defaultPassword,
      role: 'ADMIN',
    },
  });

  // 1. Create Suppliers
  const squarePharma = await prisma.supplier.upsert({
    where: { id: 'supp-square' },
    update: {},
    create: {
      id: 'supp-square',
      name: 'Square Pharmaceuticals PLC',
      email: 'order@squarepharma.com.bd',
      phone: '+880-2-8833047',
    },
  });

  const beximco = await prisma.supplier.upsert({
    where: { id: 'supp-beximco' },
    update: {},
    create: {
      id: 'supp-beximco',
      name: 'Beximco Pharma Ltd',
      email: 'supply@beximcopharma.com',
      phone: '+880-2-58611001',
    },
  });

  const incepta = await prisma.supplier.upsert({
    where: { id: 'supp-incepta' },
    update: {},
    create: {
      id: 'supp-incepta',
      name: 'Incepta Pharmaceuticals Ltd',
      email: 'distribution@inceptapharma.com',
      phone: '+880-2-8891688',
    },
  });

  // 2. Create Medicines
  const medicinesData = [
    {
      name: 'Napa Extra 500mg/65mg',
      sku: 'NAPA-EXT-500',
      quantity: 120,
      reorderThreshold: 30,
      unitPrice: 2.5,
      expiryDate: new Date('2027-06-30'),
      supplierId: beximco.id,
    },
    {
      name: 'Ace Plus (Paracetamol + Caffeine)',
      sku: 'ACE-PLUS-500',
      quantity: 8, // Low stock!
      reorderThreshold: 25,
      unitPrice: 3.0,
      expiryDate: new Date('2027-01-15'),
      supplierId: squarePharma.id,
    },
    {
      name: 'Seclo 20mg (Omeprazole)',
      sku: 'SECLO-20-OMEP',
      quantity: 55,
      reorderThreshold: 20,
      unitPrice: 7.0,
      expiryDate: new Date('2026-12-31'),
      supplierId: squarePharma.id,
    },
    {
      name: 'Monas 10mg (Montelukast)',
      sku: 'MONAS-10-MONT',
      quantity: 0, // Out of stock!
      reorderThreshold: 15,
      unitPrice: 16.5,
      expiryDate: new Date('2027-09-20'),
      supplierId: squarePharma.id,
    },
    {
      name: 'Azithromycin 500mg (Zimax)',
      sku: 'ZIMAX-500-AZI',
      quantity: 5, // Critically low!
      reorderThreshold: 20,
      unitPrice: 35.0,
      expiryDate: new Date('2026-11-10'),
      supplierId: beximco.id,
    },
    {
      name: 'Alatrol 10mg (Cetirizine)',
      sku: 'ALATROL-10-CET',
      quantity: 85,
      reorderThreshold: 20,
      unitPrice: 4.0,
      expiryDate: new Date('2028-03-31'),
      supplierId: squarePharma.id,
    },
    {
      name: 'Ceevit 250mg (Vitamin C)',
      sku: 'CEEVIT-250-VITC',
      quantity: 140,
      reorderThreshold: 40,
      unitPrice: 2.0,
      expiryDate: new Date('2027-08-15'),
      supplierId: squarePharma.id,
    },
    {
      name: 'Pantodac 20mg (Pantoprazole)',
      sku: 'PANTODAC-20-PAN',
      quantity: 12, // Low stock!
      reorderThreshold: 25,
      unitPrice: 8.5,
      expiryDate: new Date('2027-04-25'),
      supplierId: incepta.id,
    },
  ];

  for (const med of medicinesData) {
    const existing = await prisma.medicine.findUnique({
      where: { sku: med.sku },
    });
    if (!existing) {
      const created = await prisma.medicine.create({
        data: med,
      });

      // Add initial stock movement record
      if (med.quantity > 0) {
        await prisma.stockMovement.create({
          data: {
            medicineId: created.id,
            quantity: med.quantity,
            type: 'IN',
            note: 'Initial opening inventory setup',
          },
        });
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

