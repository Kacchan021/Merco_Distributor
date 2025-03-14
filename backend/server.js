// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const ExcelJS = require('exceljs'); // if you need Excel export

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(dbConfig);

// Helper to store date as "YYYY-MM-DD"
function formatDeliveryDate(inputDate) {
  const dt = new Date(inputDate);
  dt.setDate(dt.getDate() + 1); // add one day
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------------------------
// LOGIN
// ----------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM person WHERE Username = ? AND Password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

// ----------------------------------------------------------------------
// BASIC LOOKUPS (Employees, Outlets)
// ----------------------------------------------------------------------
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT EmployeeID, Name AS EmployeeName FROM employee'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching employees' });
  }
});

app.get('/api/outlets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT OutletID, OutletName FROM outlet');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching outlets' });
  }
});
// ----------------------------------------------------------------------
// SUPPLIERS
// ----------------------------------------------------------------------
app.post('/api/suppliers', async (req, res) => {
  try {
    const { personId, address, contactNo } = req.body;
    // Prevent duplicate supplier entries
    const [existing] = await pool.query(
      'SELECT * FROM supplier WHERE PersonID = ?',
      [personId]
    );
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Supplier already exists' });
    }
    await pool.query(
      'INSERT INTO supplier (PersonID, Address, ContactNo) VALUES (?, ?, ?)',
      [personId, address, contactNo]
    );
    res.json({ success: true, message: 'Supplier added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding supplier' });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM supplier');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching suppliers' });
  }
});

// ----------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------
app.post('/api/products', async (req, res) => {
  try {
    const { productName, price } = req.body;
    // Check if product exists (by name)
    const [existing] = await pool.query(
      'SELECT ProductID FROM product WHERE ProductName = ?',
      [productName]
    );
    let productId;
    if (existing.length > 0) {
      // If product exists, update its price
      productId = existing[0].ProductID;
      await pool.query(
        'UPDATE inventorydetails SET Price = ? WHERE ProductID = ?',
        [price, productId]
      );
    } else {
      // Create new product and its inventory record with initial quantity 0
      const [result] = await pool.query(
        'INSERT INTO product (ProductName) VALUES (?)',
        [productName]
      );
      productId = result.insertId;
      await pool.query(
        'INSERT INTO inventorydetails (ProductID, Quantity, Price) VALUES (?, ?, ?)',
        [productId, 0, price]
      );
    }
    res.json({ success: true, message: 'Product processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error processing product' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    // Return ProductID along with ProductName, Price, and Quantity
    const [rows] = await pool.query(`
      SELECT p.ProductID, p.ProductName, i.Price, i.Quantity
      FROM product p
      JOIN inventorydetails i ON p.ProductID = i.ProductID
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    // Delete the product from both tables
    await pool.query('DELETE FROM inventorydetails WHERE ProductID = ?', [productId]);
    await pool.query('DELETE FROM product WHERE ProductID = ?', [productId]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});
// ----------------------------------------------------------------------
// DELIVERIES
// ----------------------------------------------------------------------
app.post('/api/deliveries', async (req, res) => {
  try {
    let { deliveryDate, employeeId, outletId, cashGiven } = req.body;
    const formattedDeliveryDate = formatDeliveryDate(deliveryDate);

    // Validate employee
    const [empRows] = await pool.query(
      'SELECT * FROM employee WHERE EmployeeID = ?',
      [employeeId]
    );
    if (empRows.length === 0) {
      return res.json({ success: false, message: 'Invalid Employee ID' });
    }
    // Check duplicates
    const [existing] = await pool.query(
      'SELECT * FROM delivery WHERE DeliveryDate = ? AND EmployeeID = ? AND OutletID = ?',
      [formattedDeliveryDate, employeeId, outletId]
    );
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Duplicate delivery record' });
    }
    // Insert
    const [result] = await pool.query(
      'INSERT INTO delivery (DeliveryDate, EmployeeID, OutletID, CashGiven) VALUES (?, ?, ?, ?)',
      [formattedDeliveryDate, employeeId, outletId, cashGiven || 0]
    );
    res.json({ success: true, message: 'Delivery processed successfully', deliveryId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error processing delivery' });
  }
});

app.get('/api/deliveries', async (req, res) => {
  try {
    let query = `
      SELECT d.DeliveryID, d.DeliveryDate, d.EmployeeID, d.OutletID, d.CashGiven,
             IFNULL((
               SELECT SUM(SubTotal) FROM deliverydetails dd WHERE dd.DeliveryID = d.DeliveryID
             ), 0) AS Sales,
             d.CashGiven - IFNULL((
               SELECT SUM(SubTotal) FROM deliverydetails dd WHERE dd.DeliveryID = d.DeliveryID
             ), 0) AS Balance
      FROM delivery d
    `;
    const queryParams = [];
    const { fromDate, toDate } = req.query;
    if (fromDate && toDate) {
      // user filtering by date
      query += ' WHERE d.DeliveryDate BETWEEN ? AND ?';
      queryParams.push(fromDate, toDate);
    }
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching deliveries' });
  }
});

app.put('/api/deliveries/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    let { deliveryDate, employeeId, outletId, cashGiven } = req.body;
    const formattedDeliveryDate = formatDeliveryDate(deliveryDate);
    await pool.query(
      'UPDATE delivery SET DeliveryDate = ?, EmployeeID = ?, OutletID = ?, CashGiven = ? WHERE DeliveryID = ?',
      [formattedDeliveryDate, employeeId, outletId, cashGiven || 0, deliveryId]
    );
    res.json({ success: true, message: 'Delivery updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating delivery' });
  }
});

app.put('/api/deliveries/:id/cash', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { cashGiven } = req.body;
    await pool.query(
      'UPDATE delivery SET CashGiven = ? WHERE DeliveryID = ?',
      [cashGiven, deliveryId]
    );
    res.json({ success: true, message: 'Cash given updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating cash given' });
  }
});

app.delete('/api/deliveries/:id', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    await pool.query('DELETE FROM delivery WHERE DeliveryID = ?', [deliveryId]);
    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting delivery' });
  }
});

// ----------------------------------------------------------------------
// DELIVERY DETAILS
// ----------------------------------------------------------------------
app.post('/api/delivery-details', async (req, res) => {
  try {
    const { deliveryId, productId, deliveredQuantity, quality } = req.body;
    // check inventory
    const [invRows] = await pool.query(
      'SELECT InventoryDetailsID, Quantity, Price FROM inventorydetails WHERE ProductID = ?',
      [productId]
    );
    if (invRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No inventory record found for product' });
    }
    const inventoryRecord = invRows[0];

    // check if detail exists
    const [existingDetail] = await pool.query(
      'SELECT * FROM deliverydetails WHERE DeliveryID = ? AND ProductID = ?',
      [deliveryId, productId]
    );
    if (existingDetail.length > 0) {
      // update
      const currentDelivered = existingDetail[0].DeliveredQuantity;
      if (inventoryRecord.Quantity < deliveredQuantity) {
        return res.json({ success: false, message: 'Insufficient inventory quantity for additional delivery' });
      }
      await pool.query(
        'UPDATE inventorydetails SET Quantity = Quantity - ? WHERE InventoryDetailsID = ?',
        [deliveredQuantity, inventoryRecord.InventoryDetailsID]
      );
      const newQuantity = parseFloat(currentDelivered) + parseFloat(deliveredQuantity);
      const newSubTotal = newQuantity * inventoryRecord.Price;
      await pool.query(
        'UPDATE deliverydetails SET DeliveredQuantity = ?, SubTotal = ? WHERE DeliveryID = ? AND ProductID = ?',
        [newQuantity, newSubTotal, deliveryId, productId]
      );
      return res.json({ success: true, message: 'Delivery detail updated successfully' });
    } else {
      // insert
      if (inventoryRecord.Quantity < deliveredQuantity) {
        return res.json({ success: false, message: 'Insufficient inventory quantity' });
      }
      await pool.query(
        'UPDATE inventorydetails SET Quantity = Quantity - ? WHERE InventoryDetailsID = ?',
        [deliveredQuantity, inventoryRecord.InventoryDetailsID]
      );
      // create new DeliveryDetailsID
      const [countRows] = await pool.query(
        'SELECT COUNT(*) as count FROM deliverydetails WHERE DeliveryID = ?',
        [deliveryId]
      );
      const count = countRows[0].count;
      const newDetailId = `${deliveryId}.${count + 1}`;
      const subTotal = deliveredQuantity * inventoryRecord.Price;
      await pool.query(
        'INSERT INTO deliverydetails (DeliveryDetailsID, DeliveryID, ProductID, DeliveredQuantity, Quality, Price, SubTotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newDetailId, deliveryId, productId, deliveredQuantity, quality || null, inventoryRecord.Price, subTotal]
      );
      return res.json({ success: true, message: 'Delivery detail added successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding delivery detail' });
  }
});

app.get('/api/delivery-details/:deliveryId', async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;
    const [rows] = await pool.query(`
      SELECT dd.DeliveryDetailsID, dd.DeliveryID, p.ProductID, p.ProductName,
             dd.DeliveredQuantity, dd.Quality, dd.Price, dd.SubTotal,
             i.Quantity AS RemainingInventory
      FROM deliverydetails dd
      JOIN product p ON dd.ProductID = p.ProductID
      JOIN inventorydetails i ON p.ProductID = i.ProductID
      WHERE dd.DeliveryID = ?
    `, [deliveryId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching delivery details' });
  }
});

// ----------------------------------------------------------------------
// REPORT DETAILS, STOCKOUT, INVENTORY EXPORT, DAILY SUMMARY, etc.
// ----------------------------------------------------------------------

// Report Details
app.post('/api/report-details', async (req, res) => {
  try {
    const { reportId, inventoryDetailsId, quantitySold, specialPrice, amount, total } = req.body;
    await pool.query(
      'INSERT INTO reportdetails (ReportID, InventoryDetailsID, QuantitySold, SpecialPrice, Amount, Total) VALUES (?, ?, ?, ?, ?, ?)',
      [reportId, inventoryDetailsId, quantitySold, specialPrice, amount, total]
    );
    res.json({ success: true, message: 'Report detail added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding report detail' });
  }
});

app.get('/api/report-details/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const [rows] = await pool.query(
      'SELECT * FROM reportdetails WHERE ReportID = ?',
      [reportId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching report details' });
  }
});

// Stockout
app.post('/api/stockout', async (req, res) => {
  try {
    const { reportId, inventoryId, stockOutDate } = req.body;
    await pool.query(
      'INSERT INTO stockout (ReportID, InventoryID, StockOutDate) VALUES (?, ?, ?)',
      [reportId, inventoryId, stockOutDate]
    );
    res.json({ success: true, message: 'Stockout added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error adding stockout' });
  }
});

app.get('/api/stockout/:reportId', async (req, res) => {
  try {
    const reportId = req.params.reportId;
    const [rows] = await pool.query('SELECT * FROM stockout WHERE ReportID = ?', [reportId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching stockout' });
  }
});

// Inventory endpoints
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        det.InventoryDetailsID,
        det.ProductID,
        p.ProductName,
        det.Quantity,
        det.Price,
        det.ExpirationDate
      FROM inventorydetails det
      JOIN product p ON det.ProductID = p.ProductID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching inventory data' });
  }
});

app.put('/api/inventory', async (req, res) => {
  try {
    const { inventoryDetailsID, quantity } = req.body;
    await pool.query(
      'UPDATE inventorydetails SET Quantity = Quantity + ? WHERE InventoryDetailsID = ?',
      [quantity, inventoryDetailsID]
    );
    res.json({ success: true, message: 'Inventory updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating inventory' });
  }
});

// OPTIONAL: Single inventory record invoice (Excel export)
app.get('/api/inventory/:inventoryId/invoice', async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;
    const [invRows] = await pool.query(
      'SELECT * FROM inventory WHERE InventoryID = ?',
      [inventoryId]
    );
    if (invRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }
    const inventory = invRows[0];
    const [detRows] = await pool.query(`
      SELECT det.*, prod.ProductName
      FROM inventorydetails det
      LEFT JOIN product prod ON det.ProductID = prod.ProductID
      WHERE det.InventoryID = ?
    `, [inventoryId]);

    // Summarize by product
    const summaryMap = {};
    detRows.forEach(row => {
      if (row.ProductName) {
        summaryMap[row.ProductName] = (summaryMap[row.ProductName] || 0) + row.Quantity;
      }
    });

    const workbook = new ExcelJS.Workbook();
    const wsInventory = workbook.addWorksheet('Inventory Record');
    wsInventory.columns = [
      { header: 'InventoryID',   key: 'InventoryID',   width: 15 },
      { header: 'EmployeeID',    key: 'EmployeeID',    width: 15 },
      { header: 'InventoryDate', key: 'InventoryDate', width: 20 }
    ];
    wsInventory.addRow(inventory);

    const wsDetails = workbook.addWorksheet('Inventory Details');
    wsDetails.columns = [
      { header: 'InventoryDetailsID', key: 'InventoryDetailsID', width: 20 },
      { header: 'ProductID',          key: 'ProductID',          width: 15 },
      { header: 'ProductName',        key: 'ProductName',        width: 25 },
      { header: 'Quantity',           key: 'Quantity',           width: 15 },
      { header: 'Price',              key: 'Price',              width: 15 },
      { header: 'ExpirationDate',     key: 'ExpirationDate',     width: 20 }
    ];
    detRows.forEach(row => {
      wsDetails.addRow(row);
    });

    const wsSummary = workbook.addWorksheet('Inventory Summary');
    wsSummary.columns = [
      { header: 'ProductName',    key: 'ProductName',    width: 25 },
      { header: 'Total Quantity', key: 'TotalQuantity',  width: 15 }
    ];
    for (const productName in summaryMap) {
      wsSummary.addRow({
        ProductName: productName,
        TotalQuantity: summaryMap[productName]
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_' + inventoryId + '.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating invoice' });
  }
});

// GET all inventory as an Excel file
app.get('/api/inventory/export', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        det.InventoryDetailsID,
        det.ProductID,
        p.ProductName,
        det.Quantity,
        det.Price,
        det.ExpirationDate
      FROM inventorydetails det
      JOIN product p ON det.ProductID = p.ProductID
    `);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Full Inventory');
    worksheet.columns = [
      { header: 'InventoryDetailsID', key: 'InventoryDetailsID', width: 20 },
      { header: 'ProductID',          key: 'ProductID',          width: 15 },
      { header: 'ProductName',        key: 'ProductName',        width: 25 },
      { header: 'Quantity',           key: 'Quantity',           width: 10 },
      { header: 'Price',              key: 'Price',              width: 10 },
      { header: 'ExpirationDate',     key: 'ExpirationDate',     width: 20 }
    ];
    rows.forEach(row => {
      worksheet.addRow(row);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=FullInventory.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating inventory export' });
  }
});

// ----------------------------------------------------------------------
// DAILY SUMMARY (WRITE) - Create a new daily summary record
// ----------------------------------------------------------------------
app.post('/api/inventory-summary/manual', async (req, res) => {
  try {
    // 1) Start with current date/time
    let summaryDate = new Date();
    // 2) Add one day
    summaryDate.setDate(summaryDate.getDate() + 1);
    // 3) Force the time to 14:55:00 (2:55 pm)
    summaryDate.setHours(14, 55, 0, 0);
    // 4) Convert to MySQL datetime string "YYYY-MM-DD HH:mm:ss"
    const y  = summaryDate.getFullYear();
    const m  = String(summaryDate.getMonth() + 1).padStart(2, '0');
    const d  = String(summaryDate.getDate()).padStart(2, '0');
    const hh = String(summaryDate.getHours()).padStart(2, '0');
    const mm = String(summaryDate.getMinutes()).padStart(2, '0');
    const ss = '00';
    const mysqlDateString = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;

    // 5) Fetch inventory details and insert summary rows
    const [inventoryRows] = await pool.query(`
      SELECT InventoryDetailsID, Quantity 
      FROM inventorydetails
    `);

    for (let row of inventoryRows) {
      // Get last summary to determine BeginningInventory
      const [lastSummaryRows] = await pool.query(`
        SELECT ClosingInventory 
        FROM inventorysummary 
        WHERE InventoryDetailsID = ? 
        ORDER BY SummaryDate DESC LIMIT 1
      `, [row.InventoryDetailsID]);

      const beginningInventory = (lastSummaryRows.length > 0) 
        ? lastSummaryRows[0].ClosingInventory 
        : row.Quantity;
      const additionalInventory = row.Quantity - beginningInventory;
      await pool.query(`
        INSERT INTO inventorysummary (
          InventoryDetailsID, 
          SummaryDate, 
          BeginningInventory, 
          AdditionalInventory, 
          Transfer, 
          ClosingInventory
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        row.InventoryDetailsID,
        mysqlDateString,
        beginningInventory,
        additionalInventory,
        0,
        row.Quantity
      ]);
    }
    res.json({ success: true, message: 'Daily summary created successfully.' });
  } catch (err) {
    console.error('Error creating daily summary:', err);
    res.status(500).json({ success: false, message: 'Error creating daily summary.' });
  }
});

// ----------------------------------------------------------------------
// DAILY SUMMARY (READ) - Get all rows in a date range
// ----------------------------------------------------------------------
app.get('/api/inventory-summary', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Please provide start and end query parameters' });
    }
    const [rows] = await pool.query(`
      SELECT 
        p.ProductID,
        p.ProductName,
        s.SummaryDate,
        s.BeginningInventory,
        s.AdditionalInventory,
        s.Transfer,
        s.ClosingInventory
      FROM inventorysummary s
      JOIN inventorydetails d ON s.InventoryDetailsID = d.InventoryDetailsID
      JOIN product p ON d.ProductID = p.ProductID
      WHERE s.SummaryDate >= ? 
        AND s.SummaryDate < ?
      ORDER BY s.SummaryDate DESC, p.ProductName
    `, [start, end]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching daily inventory summary' });
  }
});

// ----------------------------------------------------------------------
// START SERVER
// ----------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
