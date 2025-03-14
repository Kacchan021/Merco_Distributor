function loadProducts() {
  fetch('http://localhost:3000/api/products')
    .then(response => response.json())
    .then(data => {
      const productList = document.getElementById('productList');
      // Create table
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Product Name', 'Price', 'Quantity', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      data.forEach(product => {
        const row = document.createElement('tr');
        
        const cellName = document.createElement('td');
        cellName.textContent = product.ProductName;
        row.appendChild(cellName);
  
        const cellPrice = document.createElement('td');
        cellPrice.textContent = product.Price;
        row.appendChild(cellPrice);
  
        const cellQuantity = document.createElement('td');
        cellQuantity.textContent = product.Quantity;
        row.appendChild(cellQuantity);
        
        // Create actions cell with a delete button
        const cellActions = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteProduct(product.ProductID));
        cellActions.appendChild(deleteButton);
        row.appendChild(cellActions);
  
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      productList.innerHTML = '';
      productList.appendChild(table);
    })
    .catch(error => console.error('Error fetching products:', error));
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadProducts();
          alert('Product deleted successfully.');
        } else {
          alert('Failed to delete product: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while deleting product.');
      });
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);

document.getElementById('productForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const productName = document.getElementById('itemName').value;
  const price = document.getElementById('price').value;
  
  fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, price })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadProducts();
        alert('Product processed successfully.');
      } else {
        alert('Failed to process product: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while processing product.');
    });
});
