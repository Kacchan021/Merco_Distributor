// suppliers.js

let selectedSupplierId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSuppliers();
  loadProductsForSupplier();
  loadSupplierInventoryDetails();

  document.getElementById('supplierForm').addEventListener('submit', addSupplierHandler);
  document.getElementById('filterSupplierBtn').addEventListener('click', filterSuppliers);
  document.getElementById('addInventoryBtn').addEventListener('click', addSupplierInventoryHandler);
});

// ---------- LOAD SUPPLIERS ----------
function loadSuppliers() {
  fetch('http://localhost:3000/api/suppliers')
    .then(response => response.json())
    .then(data => {
      displaySuppliers(data);
    })
    .catch(error => console.error('Error fetching suppliers:', error));
}

function displaySuppliers(suppliers) {
  const supplierListDiv = document.getElementById('supplierList');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Person ID', 'Address', 'Contact Number', 'Actions'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  suppliers.forEach(supplier => {
    const row = document.createElement('tr');
    
    const cellId = document.createElement('td');
    cellId.textContent = supplier.PersonID;
    row.appendChild(cellId);
    
    const cellAddress = document.createElement('td');
    cellAddress.textContent = supplier.Address;
    row.appendChild(cellAddress);
    
    const cellContact = document.createElement('td');
    cellContact.textContent = supplier.ContactNo;
    row.appendChild(cellContact);
    
    const actionsCell = document.createElement('td');
    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Select';
    selectBtn.addEventListener('click', () => {
      selectSupplier(supplier);
    });
    actionsCell.appendChild(selectBtn);
    
    row.appendChild(actionsCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  supplierListDiv.innerHTML = '';
  supplierListDiv.appendChild(table);
}

// ---------- ADD SUPPLIER ----------
function addSupplierHandler(event) {
  event.preventDefault();
  const personId = document.getElementById('personId').value;
  const address = document.getElementById('address').value;
  const contactNo = document.getElementById('contactNo').value;
  
  fetch('http://localhost:3000/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personId, address, contactNo })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Supplier added successfully.');
        loadSuppliers();
        document.getElementById('supplierForm').reset();
      } else {
        alert('Failed to add supplier: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error adding supplier:', error);
      alert('An error occurred while adding supplier.');
    });
}

// ---------- FILTER SUPPLIERS ----------
function filterSuppliers() {
  const filterValue = document.getElementById('supplierFilter').value.toLowerCase();
  fetch('http://localhost:3000/api/suppliers')
    .then(response => response.json())
    .then(data => {
      const filtered = data.filter(supplier => {
        return supplier.PersonID.toString().includes(filterValue) ||
               supplier.Address.toLowerCase().includes(filterValue) ||
               supplier.ContactNo.toLowerCase().includes(filterValue);
      });
      displaySuppliers(filtered);
    })
    .catch(error => console.error('Error filtering suppliers:', error));
}

// ---------- SELECT A SUPPLIER (for adding supplier contents) ----------
function selectSupplier(supplier) {
  selectedSupplierId = supplier.PersonID;
  document.getElementById('inventorySupplierId').value = supplier.PersonID;
  document.getElementById('addInventoryBtn').disabled = false;
}

// ---------- LOAD PRODUCTS FOR SUPPLIER INVENTORY ----------
function loadProductsForSupplier() {
  fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(data => {
      const productSelect = document.getElementById('inventoryProductId');
      productSelect.innerHTML = '<option value="">Select a product</option>';
      data.forEach(product => {
        const option = document.createElement('option');
        option.value = product.ProductID;
        option.textContent = `${product.ProductID} - ${product.ProductName}`;
        productSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading products for supplier:', error));
}

// ---------- ADD SUPPLIER INVENTORY (Add Supplier Contents) ----------
function addSupplierInventoryHandler() {
  const supplierId = selectedSupplierId;
  const productId = document.getElementById('inventoryProductId').value;
  const quantity = document.getElementById('inventoryQuantity').value;
  if (!supplierId) {
    alert('No supplier selected!');
    return;
  }
  if (!productId || !quantity) {
    alert('Please select a product and enter a quantity.');
    return;
  }
  fetch('http://localhost:3000/api/suppliers/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supplierId, productId, quantity })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Supplier contents added successfully.');
        // Clear selection fields
        document.getElementById('inventoryProductId').value = '';
        document.getElementById('inventoryQuantity').value = '';
        // Refresh supplier inventory details table
        loadSupplierInventoryDetails();
      } else {
        alert('Failed to add supplier contents: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error adding supplier contents:', error);
      alert('An error occurred while adding supplier contents.');
    });
}

// ---------- LOAD SUPPLIER INVENTORY DETAILS ----------
function loadSupplierInventoryDetails() {
  fetch('http://localhost:3000/api/suppliers/inventory-details')
    .then(response => response.json())
    .then(data => {
      displaySupplierInventoryDetails(data);
    })
    .catch(error => console.error('Error fetching supplier inventory details:', error));
}

function displaySupplierInventoryDetails(details) {
  const detailsDiv = document.getElementById('supplierDetailsTable');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Supplier ID', 'Address', 'Contact', 'Product ID', 'Product Name', 'Quantity', 'Delivery Date'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  details.forEach(record => {
    const row = document.createElement('tr');
    
    const cellSupplier = document.createElement('td');
    cellSupplier.textContent = record.SupplierID;
    row.appendChild(cellSupplier);
    
    const cellAddress = document.createElement('td');
    cellAddress.textContent = record.Address;
    row.appendChild(cellAddress);
    
    const cellContact = document.createElement('td');
    cellContact.textContent = record.ContactNo;
    row.appendChild(cellContact);
    
    const cellProductId = document.createElement('td');
    cellProductId.textContent = record.ProductID;
    row.appendChild(cellProductId);
    
    const cellProductName = document.createElement('td');
    cellProductName.textContent = record.ProductName;
    row.appendChild(cellProductName);
    
    const cellQuantity = document.createElement('td');
    cellQuantity.textContent = record.Quantity;
    row.appendChild(cellQuantity);
    
    const cellDate = document.createElement('td');
    cellDate.textContent = new Date(record.DeliveryDate).toLocaleString();
    row.appendChild(cellDate);
    
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  detailsDiv.innerHTML = '';
  detailsDiv.appendChild(table);
}
