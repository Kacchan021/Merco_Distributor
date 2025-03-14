/****************************************************
 * 1) Load Real-Time Inventory
 ****************************************************/
function loadInventory() {
  fetch('http://localhost:3000/api/inventory')
    .then(response => response.json())
    .then(data => {
      const inventoryList = document.getElementById('inventoryList');
      
      // Create table
      const table = document.createElement('table');
      table.classList.add('inventory-table'); // optional styling
      
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Product ID', 'Product Name', 'Quantity', 'Action'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      data.forEach(item => {
        const row = document.createElement('tr');
        
        // Product ID
        const cellProdId = document.createElement('td');
        cellProdId.textContent = item.ProductID;
        row.appendChild(cellProdId);

        // Product Name
        const cellProdName = document.createElement('td');
        cellProdName.textContent = item.ProductName;
        row.appendChild(cellProdName);
        
        // Quantity
        const cellQuantity = document.createElement('td');
        cellQuantity.textContent = item.Quantity;
        row.appendChild(cellQuantity);
        
        // Action (Update)
        const cellAction = document.createElement('td');
        const updateButton = document.createElement('button');
        updateButton.textContent = "Update";
        updateButton.addEventListener('click', () => {
          const change = prompt("Enter quantity change (can be negative):");
          if (change !== null && !isNaN(change)) {
            fetch('http://localhost:3000/api/inventory', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                inventoryDetailsID: item.InventoryDetailsID, 
                quantity: parseInt(change) 
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert('Inventory updated successfully.');
                loadInventory(); // Reload
              } else {
                alert('Failed to update inventory: ' + data.message);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert('An error occurred while updating inventory.');
            });
          } else {
            alert("Invalid input.");
          }
        });
        cellAction.appendChild(updateButton);
        row.appendChild(cellAction);
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      
      // Clear and show
      inventoryList.innerHTML = '';
      inventoryList.appendChild(table);
    })
    .catch(error => console.error('Error fetching inventory:', error));
}

/****************************************************
 * 2) Download Full Inventory as Excel
 ****************************************************/
function downloadInventoryReport() {
  // Triggers the GET /api/inventory/export route
  window.location.href = 'http://localhost:3000/api/inventory/export';
}

/****************************************************
 * 3) Create a Daily Summary
 ****************************************************/
function createDailySummary() {
  fetch('http://localhost:3000/api/inventory-summary/manual', {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Daily summary created successfully.');
      } else {
        alert('Failed to create daily summary: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error creating daily summary:', error);
      alert('An error occurred while creating daily summary.');
    });
}

/****************************************************
 * 4) Helper: Format Date/Time as "YYYY-MM-DD h:mm am/pm"
 ****************************************************/
function formatDateTime(dateString) {
  // Attempt to parse
  const date = new Date(dateString);
  if (isNaN(date)) {
    // If invalid, just return the original string
    return dateString;
  }
  
  // Extract components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const isPM = hours >= 12 ? true : false;
  const ampm = isPM ? 'pm' : 'am';
  
  // Convert 24-hour to 12-hour
  if (hours === 0) {
    hours = 12; 
  } else if (hours > 12) {
    hours -= 12;
  }
  
  // Pad minutes
  minutes = String(minutes).padStart(2, '0');
  
  // Build final string
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
}

/****************************************************
 * 5) Load Daily Summary from inventorysummary
 ****************************************************/
function loadDailySummary() {
  const startInput = document.getElementById('startDate').value; 
  const endInput   = document.getElementById('endDate').value;   

  if (!startInput || !endInput) {
    alert("Please select both start and end date/time.");
    return;
  }

  // Convert "datetime-local" to "YYYY-MM-DD HH:MM:SS"
  const startDateTime = startInput.replace('T', ' ') + ':00'; 
  const endDateTime   = endInput.replace('T', ' ') + ':00';

  const url = `http://localhost:3000/api/inventory-summary?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) {
        alert("Error loading summary: " + (data.message || 'Unknown error'));
        return;
      }
      const dailySummaryList = document.getElementById('dailySummaryList');
      
      // Build a table for daily summary
      const table = document.createElement('table');
      table.classList.add('daily-summary-table');
      
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      [
        'Product ID', 
        'Product Name', 
        'Summary Date', 
        'Beginning', 
        'Additional', 
        'Transfer', 
        'Closing'
      ].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      data.forEach(item => {
        const row = document.createElement('tr');
        
        // Product ID
        const cellProdId = document.createElement('td');
        cellProdId.textContent = item.ProductID;
        row.appendChild(cellProdId);

        // Product Name
        const cellProdName = document.createElement('td');
        cellProdName.textContent = item.ProductName;
        row.appendChild(cellProdName);

        // SummaryDate
        const cellDate = document.createElement('td');
        // Use our formatting function
        cellDate.textContent = formatDateTime(item.SummaryDate);
        row.appendChild(cellDate);

        // BeginningInventory
        const cellBegin = document.createElement('td');
        cellBegin.textContent = item.BeginningInventory;
        row.appendChild(cellBegin);

        // AdditionalInventory
        const cellAdd = document.createElement('td');
        cellAdd.textContent = item.AdditionalInventory;
        row.appendChild(cellAdd);

        // Transfer
        const cellTransfer = document.createElement('td');
        cellTransfer.textContent = item.Transfer;
        row.appendChild(cellTransfer);

        // ClosingInventory
        const cellClose = document.createElement('td');
        cellClose.textContent = item.ClosingInventory;
        row.appendChild(cellClose);

        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      dailySummaryList.innerHTML = '';
      dailySummaryList.appendChild(table);
    })
    .catch(error => {
      console.error('Error fetching daily summary:', error);
      alert('Error loading daily summary.');
    });
}

/****************************************************
 * 6) Toggle Daily Summary Visibility
 ****************************************************/
function toggleDailySummary() {
  const dailySummaryList = document.getElementById('dailySummaryList');
  // If hidden, load and show it; if visible, hide it.
  if (dailySummaryList.style.display === 'none' || dailySummaryList.style.display === '') {
    loadDailySummary();
    dailySummaryList.style.display = 'block';
  } else {
    dailySummaryList.style.display = 'none';
  }
}

/****************************************************
 * 7) On DOM load, set up event listeners
 ****************************************************/
document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
  document.getElementById('downloadInvoice').addEventListener('click', downloadInventoryReport);
  document.getElementById('createDailySummaryBtn').addEventListener('click', createDailySummary);
  // Toggle summary on button click
  document.getElementById('loadSummaryBtn').addEventListener('click', toggleDailySummary);
});
