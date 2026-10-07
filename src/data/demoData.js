/**
 * Demo Data Generator for ReceiptGuard AI
 *
 * Rules:
 * 1. Seeds ~25 realistic transactions relative to today's date (so weekly spikes and dates are always current)
 * 2. Seeds an existing ₹420 Starbucks receipt on today's date
 * 3. Seeds 3-4 earlier Electronics purchases between ₹1,800 and ₹3,000 (mean ~₹2,300)
 * 4. Does NOT include the duplicate Starbucks receipt or the ₹8,499 Electronics purchase (those will be uploaded live)
 * 5. Includes a variety of Food, Travel, Shopping, Bills, Supplies, Other
 */

/**
 * Returns an ISO date string (YYYY-MM-DD) offset by a given number of days from today.
 * @param {number} offsetDays - Negative for past days
 * @returns {string}
 */
export function getRelativeDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/**
 * Generates ~25 realistic seeded transactions for demo & testing.
 * @returns {Array<object>}
 */
export function generateDemoTransactions() {
  return [
    // 1. Existing Starbucks receipt on TODAY's date (target for duplicate alert live upload)
    {
      id: 'demo_seed_starbucks_existing',
      merchant: 'Starbucks Coffee',
      date: getRelativeDate(0), // Today
      total: 420.0,
      currency: 'INR',
      category: 'Food',
      tax: {
        total: 20.0,
        breakdown: [
          { label: 'CGST 2.5%', amount: 10.0 },
          { label: 'SGST 2.5%', amount: 10.0 },
        ],
      },
      items: [
        { name: 'Caffe Latte (Grande)', amount: 270.0 },
        { name: 'Chocolate Chip Cookie', amount: 130.0 },
      ],
      // Known perceptual hash matching our Starbucks sample receipt
      imageHash: '1111000011110000111100001111000011110000111100001111000011110000',
      savedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },

    // 2-5. 4 earlier Electronics purchases between ₹1,800 and ₹3,000 (baseline for unusual expense detection)
    {
      id: 'demo_seed_elec_1',
      merchant: 'Croma Electronics',
      date: getRelativeDate(-22),
      total: 1850.0,
      currency: 'INR',
      category: 'Electronics',
      tax: {
        total: 282.2,
        breakdown: [
          { label: 'CGST 9%', amount: 141.1 },
          { label: 'SGST 9%', amount: 141.1 },
        ],
      },
      items: [{ name: 'Logitech Wireless Mouse M235', amount: 1567.8 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 22).toISOString(),
    },
    {
      id: 'demo_seed_elec_2',
      merchant: 'Reliance Digital',
      date: getRelativeDate(-17),
      total: 2199.0,
      currency: 'INR',
      category: 'Electronics',
      tax: {
        total: 335.44,
        breakdown: [
          { label: 'CGST 9%', amount: 167.72 },
          { label: 'SGST 9%', amount: 167.72 },
        ],
      },
      items: [{ name: 'Boat Airdopes 141', amount: 1863.56 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
    },
    {
      id: 'demo_seed_elec_3',
      merchant: 'Vijay Sales',
      date: getRelativeDate(-11),
      total: 2499.0,
      currency: 'INR',
      category: 'Electronics',
      tax: {
        total: 381.2,
        breakdown: [
          { label: 'CGST 9%', amount: 190.6 },
          { label: 'SGST 9%', amount: 190.6 },
        ],
      },
      items: [{ name: 'SanDisk 1TB Portable SSD Case & Cable', amount: 2117.8 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
    },
    {
      id: 'demo_seed_elec_4',
      merchant: 'Amazon India',
      date: getRelativeDate(-6),
      total: 2899.0,
      currency: 'INR',
      category: 'Electronics',
      tax: {
        total: 442.22,
        breakdown: [
          { label: 'IGST 18%', amount: 442.22 },
        ],
      },
      items: [{ name: 'Anker PowerCore 20000mAh Power Bank', amount: 2456.78 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    },

    // 6-10. Food transactions spread over weeks
    {
      id: 'demo_seed_food_1',
      merchant: 'Swiggy',
      date: getRelativeDate(-26),
      total: 540.0,
      currency: 'INR',
      category: 'Food',
      tax: { total: 25.7, breakdown: [{ label: 'GST 5%', amount: 25.7 }] },
      items: [{ name: 'Paneer Butter Masala & Naan', amount: 514.3 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 26).toISOString(),
    },
    {
      id: 'demo_seed_food_2',
      merchant: 'Zomato',
      date: getRelativeDate(-19),
      total: 380.0,
      currency: 'INR',
      category: 'Food',
      tax: { total: 18.0, breakdown: [{ label: 'GST 5%', amount: 18.0 }] },
      items: [{ name: 'Subway Veggie Delite Combo', amount: 362.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 19).toISOString(),
    },
    {
      id: 'demo_seed_food_3',
      merchant: 'Haldirams',
      date: getRelativeDate(-13),
      total: 620.0,
      currency: 'INR',
      category: 'Food',
      tax: { total: 29.5, breakdown: [{ label: 'GST 5%', amount: 29.5 }] },
      items: [{ name: 'Thali & Gulab Jamun', amount: 590.5 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
    },
    {
      id: 'demo_seed_food_4',
      merchant: 'Blue Tokai Coffee',
      date: getRelativeDate(-4),
      total: 310.0,
      currency: 'INR',
      category: 'Food',
      tax: { total: 14.7, breakdown: [{ label: 'GST 5%', amount: 14.7 }] },
      items: [{ name: 'Flat White & Almond Biscotti', amount: 295.3 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    },
    {
      id: 'demo_seed_food_5',
      merchant: 'McDonalds',
      date: getRelativeDate(-1),
      total: 450.0,
      currency: 'INR',
      category: 'Food',
      tax: { total: 21.4, breakdown: [{ label: 'GST 5%', amount: 21.4 }] },
      items: [{ name: 'McSpicy Paneer Meal', amount: 428.6 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    },

    // 11-14. Travel
    {
      id: 'demo_seed_travel_1',
      merchant: 'Uber India',
      date: getRelativeDate(-24),
      total: 345.0,
      currency: 'INR',
      category: 'Travel',
      tax: { total: 16.4, breakdown: [{ label: 'GST 5%', amount: 16.4 }] },
      items: [{ name: 'Uber Go Trip - Koramangala to Indiranagar', amount: 328.6 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 24).toISOString(),
    },
    {
      id: 'demo_seed_travel_2',
      merchant: 'Ola Cabs',
      date: getRelativeDate(-18),
      total: 280.0,
      currency: 'INR',
      category: 'Travel',
      tax: { total: 13.3, breakdown: [{ label: 'GST 5%', amount: 13.3 }] },
      items: [{ name: 'Ola Prime Sedan City Ride', amount: 266.7 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    },
    {
      id: 'demo_seed_travel_3',
      merchant: 'Metro SmartCard Recharge',
      date: getRelativeDate(-9),
      total: 500.0,
      currency: 'INR',
      category: 'Travel',
      tax: { total: 0, breakdown: [] },
      items: [{ name: 'Metro Transit Fare Recharge', amount: 500.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    },
    {
      id: 'demo_seed_travel_4',
      merchant: 'Indian Oil Corporation',
      date: getRelativeDate(-3),
      total: 1200.0,
      currency: 'INR',
      category: 'Travel',
      tax: { total: 0, breakdown: [] },
      items: [{ name: 'Petrol XP95 Fuel', amount: 1200.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },

    // 15-18. Shopping
    {
      id: 'demo_seed_shop_1',
      merchant: 'Decathlon Sports India',
      date: getRelativeDate(-25),
      total: 1499.0,
      currency: 'INR',
      category: 'Shopping',
      tax: { total: 160.6, breakdown: [{ label: 'GST 12%', amount: 160.6 }] },
      items: [{ name: 'Kiprun Running Shoes', amount: 1338.4 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 25).toISOString(),
    },
    {
      id: 'demo_seed_shop_2',
      merchant: 'Uniqlo India',
      date: getRelativeDate(-16),
      total: 1990.0,
      currency: 'INR',
      category: 'Shopping',
      tax: { total: 213.2, breakdown: [{ label: 'GST 12%', amount: 213.2 }] },
      items: [{ name: 'AIRism Cotton Crew Neck T-Shirt (2x)', amount: 1776.8 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString(),
    },
    {
      id: 'demo_seed_shop_3',
      merchant: 'Myntra Fashion',
      date: getRelativeDate(-8),
      total: 1249.0,
      currency: 'INR',
      category: 'Shopping',
      tax: { total: 133.8, breakdown: [{ label: 'GST 12%', amount: 133.8 }] },
      items: [{ name: 'Roadster Denim Casual Shirt', amount: 1115.2 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    },
    {
      id: 'demo_seed_shop_4',
      merchant: 'Crossword Bookstore',
      date: getRelativeDate(-2),
      total: 799.0,
      currency: 'INR',
      category: 'Shopping',
      tax: { total: 0, breakdown: [] },
      items: [{ name: 'Designing Data-Intensive Applications', amount: 799.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },

    // 19-21. Bills
    {
      id: 'demo_seed_bills_1',
      merchant: 'Airtel Broadband Fiber',
      date: getRelativeDate(-27),
      total: 1178.0,
      currency: 'INR',
      category: 'Bills',
      tax: {
        total: 179.7,
        breakdown: [
          { label: 'CGST 9%', amount: 89.85 },
          { label: 'SGST 9%', amount: 89.85 },
        ],
      },
      items: [{ name: 'Airtel Xstream Fiber 200Mbps Plan', amount: 998.3 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 27).toISOString(),
    },
    {
      id: 'demo_seed_bills_2',
      merchant: 'BESCOM Electricity Bill',
      date: getRelativeDate(-20),
      total: 1650.0,
      currency: 'INR',
      category: 'Bills',
      tax: { total: 0, breakdown: [] },
      items: [{ name: 'Domestic Electricity Consumption - Sept', amount: 1650.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    },
    {
      id: 'demo_seed_bills_3',
      merchant: 'Jio Prepaid Mobile',
      date: getRelativeDate(-7),
      total: 749.0,
      currency: 'INR',
      category: 'Bills',
      tax: {
        total: 114.25,
        breakdown: [
          { label: 'CGST 9%', amount: 57.13 },
          { label: 'SGST 9%', amount: 57.13 },
        ],
      },
      items: [{ name: '84-day 2GB/Day Prepaid Data Recharge', amount: 634.75 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    },

    // 22-24. Supplies
    {
      id: 'demo_seed_supplies_1',
      merchant: 'Blinkit Groceries',
      date: getRelativeDate(-23),
      total: 820.0,
      currency: 'INR',
      category: 'Supplies',
      tax: { total: 39.0, breakdown: [{ label: 'GST 5%', amount: 39.0 }] },
      items: [{ name: 'Fresh Vegetables, Milk, Bread, Eggs', amount: 781.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 23).toISOString(),
    },
    {
      id: 'demo_seed_supplies_2',
      merchant: 'Zepto Quick Delivery',
      date: getRelativeDate(-14),
      total: 610.0,
      currency: 'INR',
      category: 'Supplies',
      tax: { total: 29.0, breakdown: [{ label: 'GST 5%', amount: 29.0 }] },
      items: [{ name: 'Kitchen Paper Towels & Cleaning Detergent', amount: 581.0 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    },
    {
      id: 'demo_seed_supplies_3',
      merchant: 'Nature Basket Store',
      date: getRelativeDate(-5),
      total: 1350.0,
      currency: 'INR',
      category: 'Supplies',
      tax: { total: 64.3, breakdown: [{ label: 'GST 5%', amount: 64.3 }] },
      items: [{ name: 'Organic Olive Oil & Spices', amount: 1285.7 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },

    // 25. Other
    {
      id: 'demo_seed_other_1',
      merchant: 'Cult.Fit Fitness Gym',
      date: getRelativeDate(-15),
      total: 2400.0,
      currency: 'INR',
      category: 'Other',
      tax: {
        total: 366.1,
        breakdown: [
          { label: 'CGST 9%', amount: 183.05 },
          { label: 'SGST 9%', amount: 183.05 },
        ],
      },
      items: [{ name: 'Monthly Cultpass Elite Access', amount: 2033.9 }],
      savedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    },
  ];
}
