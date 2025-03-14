/****************************************************
 * 1) Helper: Convert User-Selected Date to "YYYY-MM-DD"
 *    (Adds +1 day because your system is offset by one day)
 ****************************************************/
function convertAndFormatDeliveryDate(inputDate) {
  const date = new Date(inputDate);
  date.setDate(date.getDate() + 1); // add one day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // stored in DB as YYYY-MM-DD
}

/****************************************************
 * 2) Helper: Display Delivery Date as "YYYY/MM/DD"
 ****************************************************/
function formatDateSlash(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    // If parsing fails, return original string
    return dateString;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`; // note slashes
}

let selectedDeliveryId = null; // currently selected delivery

document.addEventListener('DOMContentLoaded', () => {
  loadEmployees();
  loadOutlets();
  loadProductsForDelivery();
  loadDeliveries();

  // Form to add new delivery
  document.getElementById('deliveryForm').addEventListener('submit', addDeliveryHandler);

  // Button to add a product line to selected delivery
  document.getElementById('addDetailBtn').addEventListener('click', addDeliveryDetailHandler);

  // Filter button
  document.getElementById('filterBtn').addEventListener('click', loadDeliveries);

  // Update cash button
  document.getElementById('updateCashBtn').addEventListener('click', updateCashGiven);
});

// ---------- LOAD EMPLOYEES ----------
function loadEmployees() {
  fetch('http://localhost:3000/api/employees')
    .then(response => response.json())
    .then(data => {
      const employeeSelect = document.getElementById('employeeId');
      employeeSelect.innerHTML = '';
      data.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.EmployeeID;
        option.textContent = emp.EmployeeName
          ? `${emp.EmployeeID} - ${emp.EmployeeName}`
          : emp.EmployeeID;
        employeeSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading employees:', error));
}

// ---------- LOAD OUTLETS ----------
function loadOutlets() {
  fetch('http://localhost:3000/api/outlets')
    .then(response => response.json())
    .then(data => {
      const outletSelect = document.getElementById('outletId');
      outletSelect.innerHTML = '';
      data.forEach(outlet => {
        const option = document.createElement('option');
        option.value = outlet.OutletID;
        option.textContent = outlet.OutletName
          ? `${outlet.OutletID} - ${outlet.OutletName}`
          : outlet.OutletID;
        outletSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading outlets:', error));
}

// ---------- LOAD PRODUCTS FOR DELIVERY (combobox) ----------
function loadProductsForDelivery() {
  fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(data => {
      const productSelect = document.getElementById('detailProductId');
      productSelect.innerHTML = '<option value="">Select a product</option>';
      data.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.ProductID;
        option.textContent = `${prod.ProductID} - ${prod.ProductName}`;
        productSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error loading products for delivery:', error));
}

// ---------- ADD DELIVERY ----------
function addDeliveryHandler(event) {
  event.preventDefault();
  const inputDate = document.getElementById('deliveryDate').value;
  const formattedDate = convertAndFormatDeliveryDate(inputDate); // store as YYYY-MM-DD
  const employeeId = document.getElementById('employeeId').value;
  const outletId = document.getElementById('outletId').value;
  const cashGiven = document.getElementById('cashGiven').value || 0;

  fetch('http://localhost:3000/api/deliveries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryDate: formattedDate, employeeId, outletId, cashGiven }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Delivery added successfully.');
        loadDeliveries();
        document.getElementById('deliveryForm').reset();
      } else {
        alert('Failed to add delivery: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error adding delivery:', error);
      alert('An error occurred while adding delivery.');
    });
}

// ---------- LOAD DELIVERIES (with optional date filtering) ----------
function loadDeliveries() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  let url = 'http://localhost:3000/api/deliveries';
  if (fromDate && toDate) {
    url += `?fromDate=${fromDate}&toDate=${toDate}`;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const deliveryListDiv = document.getElementById('deliveryList');
      // Build table
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Delivery ID', 'Delivery Date', 'Employee ID', 'Outlet ID', 'Cash Given', 'Sales', 'Balance', 'Actions']
        .forEach(col => {
          const th = document.createElement('th');
          th.textContent = col;
          headerRow.appendChild(th);
        });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      let totalSalesSum = 0;
      let totalBalanceSum = 0;
      data.forEach(delivery => {
        const row = document.createElement('tr');

        // Delivery ID
        const idCell = document.createElement('td');
        idCell.textContent = delivery.DeliveryID;
        row.appendChild(idCell);

        // Delivery Date (format to YYYY/MM/DD)
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDateSlash(delivery.DeliveryDate);
        row.appendChild(dateCell);

        // EmployeeID
        const empCell = document.createElement('td');
        empCell.textContent = delivery.EmployeeID;
        row.appendChild(empCell);

        // OutletID
        const outletCell = document.createElement('td');
        outletCell.textContent = delivery.OutletID;
        row.appendChild(outletCell);

        // Cash Given
        const cashCell = document.createElement('td');
        cashCell.textContent = delivery.CashGiven;
        row.appendChild(cashCell);

        // Sales
        const salesCell = document.createElement('td');
        salesCell.textContent = parseFloat(delivery.Sales).toFixed(2);
        row.appendChild(salesCell);

        // Balance
        const balanceCell = document.createElement('td');
        balanceCell.textContent = parseFloat(delivery.Balance).toFixed(2);
        row.appendChild(balanceCell);

        // Actions
        const actionsCell = document.createElement('td');
        // Details button
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Details';
        detailsBtn.addEventListener('click', () => {
          selectDelivery(delivery.DeliveryID);
        });
        actionsCell.appendChild(detailsBtn);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
          editDelivery(delivery);
        });
        actionsCell.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          deleteDelivery(delivery.DeliveryID);
        });
        actionsCell.appendChild(deleteBtn);

        row.appendChild(actionsCell);
        tbody.appendChild(row);

        totalSalesSum += parseFloat(delivery.Sales);
        totalBalanceSum += parseFloat(delivery.Balance);
      });
      table.appendChild(tbody);
      deliveryListDiv.innerHTML = '';
      deliveryListDiv.appendChild(table);

      // Summary
      const summaryDiv = document.createElement('div');
      summaryDiv.innerHTML = `
        <p>Total Sales: $${totalSalesSum.toFixed(2)}</p>
        <p>Total Balance: $${totalBalanceSum.toFixed(2)}</p>
      `;
      deliveryListDiv.appendChild(summaryDiv);
    })
    .catch(error => console.error('Error loading deliveries:', error));
}

// ---------- SELECT A DELIVERY (for details) ----------
function selectDelivery(deliveryId) {
  selectedDeliveryId = deliveryId;
  document.getElementById('addDetailBtn').disabled = false;
  loadDeliveryDetails(deliveryId);
}

// ---------- LOAD DELIVERY DETAILS ----------
function loadDeliveryDetails(deliveryId) {
  fetch(`http://localhost:3000/api/delivery-details/${deliveryId}`)
    .then(response => response.json())
    .then(data => {
      const detailsDiv = document.getElementById('deliveryDetailsTable');
      // Build table
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      [
        'Delivery Details No.', 
        'Product No.', 
        'Product Name', 
        'Delivered Quantity', 
        'Price', 
        'SubTotal', 
        'Remaining Inventory'
      ].forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      let totalSum = 0;
      data.forEach(detail => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = detail.DeliveryDetailsID;
        row.appendChild(idCell);

        const prodIdCell = document.createElement('td');
        prodIdCell.textContent = detail.ProductID;
        row.appendChild(prodIdCell);

        const prodNameCell = document.createElement('td');
        prodNameCell.textContent = detail.ProductName;
        row.appendChild(prodNameCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = detail.DeliveredQuantity;
        row.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = detail.Price;
        row.appendChild(priceCell);

        const subTotalCell = document.createElement('td');
        subTotalCell.textContent = detail.SubTotal;
        row.appendChild(subTotalCell);

        totalSum += parseFloat(detail.SubTotal);

        const remainCell = document.createElement('td');
        remainCell.textContent = detail.RemainingInventory;
        row.appendChild(remainCell);

        tbody.appendChild(row);
      });

      // Final row for total
      const totalRow = document.createElement('tr');
      const totalLabelCell = document.createElement('td');
      totalLabelCell.colSpan = 5;
      totalLabelCell.style.textAlign = 'right';
      totalLabelCell.textContent = 'Total:';
      totalRow.appendChild(totalLabelCell);

      const totalValueCell = document.createElement('td');
      totalValueCell.textContent = totalSum.toFixed(2);
      totalRow.appendChild(totalValueCell);

      const emptyCell = document.createElement('td');
      totalRow.appendChild(emptyCell);

      tbody.appendChild(totalRow);

      table.appendChild(tbody);
      detailsDiv.innerHTML = '';
      detailsDiv.appendChild(table);

      // Update balance UI
      document.getElementById('totalPrice').textContent = totalSum.toFixed(2);
      updateBalance();
    })
    .catch(error => {
      console.error('Error loading delivery details:', error);
    });
}

// ---------- ADD DELIVERY DETAIL (Product) ----------
function addDeliveryDetailHandler() {
  const productId = document.getElementById('detailProductId').value;
  const deliveredQuantity = document.getElementById('detailQuantity').value;

  if (!selectedDeliveryId) {
    alert('No delivery selected!');
    return;
  }
  if (!productId || !deliveredQuantity) {
    alert('Please select a product and enter a quantity.');
    return;
  }

  fetch('http://localhost:3000/api/delivery-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deliveryId: selectedDeliveryId,
      productId,
      deliveredQuantity
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Product line added/updated successfully.');
        loadDeliveryDetails(selectedDeliveryId);
        document.getElementById('detailProductId').value = '';
        document.getElementById('detailQuantity').value = '';
      } else {
        alert('Failed to add/update product line: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error adding delivery detail:', error);
      alert('An error occurred while adding product line.');
    });
}

// ---------- EDIT DELIVERY ----------
function editDelivery(delivery) {
  document.getElementById('deliveryDate').value = delivery.DeliveryDate; 
  document.getElementById('employeeId').value = delivery.EmployeeID;
  document.getElementById('outletId').value = delivery.OutletID;
  document.getElementById('cashGiven').value = delivery.CashGiven;

  const form = document.getElementById('deliveryForm');
  form.removeEventListener('submit', addDeliveryHandler);

  const updateHandler = function(event) {
    event.preventDefault();
    const inputDate = document.getElementById('deliveryDate').value;
    const updatedDate = convertAndFormatDeliveryDate(inputDate);
    const updatedEmp = document.getElementById('employeeId').value;
    const updatedOut = document.getElementById('outletId').value;
    const updatedCash = document.getElementById('cashGiven').value || 0;

    fetch(`http://localhost:3000/api/deliveries/${delivery.DeliveryID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deliveryDate: updatedDate,
        employeeId: updatedEmp,
        outletId: updatedOut,
        cashGiven: updatedCash
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Delivery updated successfully.');
          loadDeliveries();
          form.removeEventListener('submit', updateHandler);
          form.addEventListener('submit', addDeliveryHandler);
          form.reset();
        } else {
          alert('Failed to update delivery: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error updating delivery:', error);
        alert('An error occurred while updating delivery.');
      });
  };

  form.addEventListener('submit', updateHandler);
}

// ---------- DELETE DELIVERY ----------
function deleteDelivery(deliveryId) {
  if (!confirm('Are you sure you want to delete this delivery?')) {
    return;
  }
  fetch(`http://localhost:3000/api/deliveries/${deliveryId}`, {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Delivery deleted successfully.');
        loadDeliveries();
        if (selectedDeliveryId === deliveryId) {
          selectedDeliveryId = null;
          document.getElementById('deliveryDetailsTable').innerHTML = '';
          document.getElementById('addDetailBtn').disabled = true;
        }
      } else {
        alert('Failed to delete delivery: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error deleting delivery:', error);
      alert('An error occurred while deleting delivery.');
    });
}

// ---------- UPDATE BALANCE (UI only) ----------
function updateBalance() {
  const total = parseFloat(document.getElementById('totalPrice').textContent) || 0;
  const cash = parseFloat(document.getElementById('cashGiven').value) || 0;
  const balance = cash - total;
  document.getElementById('balanceAmount').textContent = balance.toFixed(2);
}

// ---------- UPDATE CASH GIVEN (server update) ----------
function updateCashGiven() {
  if (!selectedDeliveryId) {
    alert('Please select a delivery first.');
    return;
  }
  const cash = parseFloat(document.getElementById('cashGiven').value) || 0;
  fetch(`http://localhost:3000/api/deliveries/${selectedDeliveryId}/cash`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cashGiven: cash })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Cash updated successfully.');
        loadDeliveries();
        updateBalance();
      } else {
        alert('Failed to update cash: ' + data.message);
      }
    })
    .catch(error => console.error('Error updating cash given:', error));
}
