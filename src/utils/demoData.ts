// Client-safe demo data (no server imports)
export const demoPromises = [
  {
    price: 1500,
    deliveryCharges: 50,
    deliveryTime: '2-3 days',
    returnPolicy: '7 days return policy',
    productDescription: 'Wireless Bluetooth Headphones with noise cancellation'
  },
  {
    price: 2500,
    deliveryCharges: 0,
    deliveryTime: '1-2 days',
    returnPolicy: '15 days return policy',
    productDescription: 'Cotton Kurti with embroidered work, Size M'
  }
];

export const demoInvoices = [
  // Matching invoice (good seller)
  {
    price: 1500,
    deliveryCharges: 50,
    deliveryTime: '2-3 days',
    returnPolicy: '7 days return policy',
    productDescription: 'Wireless Bluetooth Headphones with noise cancellation',
    invoiceNumber: 'INV-001',
    invoiceDate: '2024-01-15'
  },
  // Mismatched invoice (problematic seller)
  {
    price: 2800, // Higher than promised
    deliveryCharges: 100, // Added charges
    deliveryTime: '5-7 days', // Longer than promised
    returnPolicy: 'No returns', // Different policy
    productDescription: 'Basic Cotton Kurti, Size M', // Different description
    invoiceNumber: 'INV-002',
    invoiceDate: '2024-01-15'
  }
];