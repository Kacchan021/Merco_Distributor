-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2025 at 09:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mercodistributor`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `ProcessDelivery` (IN `DeliveryDate` DATE, IN `EmployeeID` INT, IN `OutletID` INT)   BEGIN
    INSERT INTO Delivery (DeliveryDate, EmployeeID, OutletID) 
    VALUES (DeliveryDate, EmployeeID, OutletID);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegisterProduct` (IN `ProductName` VARCHAR(100), IN `Price` DECIMAL(10,2), IN `Quantity` INT)   BEGIN
    INSERT INTO Product (ProductName) VALUES (ProductName);
    
    
    INSERT INTO InventoryDetails (InventoryID, ProductID, Quantity, Price)
    VALUES ((SELECT InventoryID FROM Inventory ORDER BY InventoryID DESC LIMIT 1), 
            (SELECT ProductID FROM Product WHERE ProductName = ProductName ORDER BY ProductID DESC LIMIT 1), 
            Quantity, Price);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `civilstatus`
--

CREATE TABLE `civilstatus` (
  `CivilStatusID` int(11) NOT NULL,
  `CivilStatusName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `civilstatus`
--

INSERT INTO `civilstatus` (`CivilStatusID`, `CivilStatusName`) VALUES
(1, 'Single'),
(2, 'Married');

-- --------------------------------------------------------

--
-- Table structure for table `delivery`
--

CREATE TABLE `delivery` (
  `DeliveryID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `OutletID` int(11) DEFAULT NULL,
  `DeliveryDate` date NOT NULL,
  `CashGiven` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery`
--

INSERT INTO `delivery` (`DeliveryID`, `EmployeeID`, `OutletID`, `DeliveryDate`, `CashGiven`) VALUES
(23, 10, 13, '2025-03-13', 200.00),
(25, 10, 13, '2025-03-17', 1300.00),
(26, 10, 13, '2025-03-18', 0.00),
(27, 10, 13, '2025-03-18', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `deliverydetails`
--

CREATE TABLE `deliverydetails` (
  `DeliveryDetailsID` decimal(10,2) NOT NULL,
  `DeliveryID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `DeliveredQuantity` int(11) NOT NULL,
  `Quality` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `SubTotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `LineNotes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `deliverydetails`
--

INSERT INTO `deliverydetails` (`DeliveryDetailsID`, `DeliveryID`, `ProductID`, `DeliveredQuantity`, `Quality`, `Price`, `Total`, `SubTotal`, `Discount`, `Tax`, `LineNotes`) VALUES
(23.10, 23, 30, 5, NULL, 13.00, 0.00, 65.00, 0.00, 0.00, NULL),
(23.20, 23, 34, 5, NULL, 21.00, 0.00, 105.00, 0.00, 0.00, NULL),
(25.10, 25, 30, 95, NULL, 13.00, 0.00, 1235.00, 0.00, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `EmployeeID` int(11) NOT NULL,
  `PersonID` int(11) DEFAULT NULL,
  `DateHired` date NOT NULL,
  `Name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`EmployeeID`, `PersonID`, `DateHired`, `Name`) VALUES
(10, 3, '2024-03-10', 'Alice Johnson'),
(11, 4, '2024-03-11', 'Bob Smith'),
(12, 5, '2024-03-12', 'Charlie Brown');

-- --------------------------------------------------------

--
-- Table structure for table `gender`
--

CREATE TABLE `gender` (
  `GenderID` int(11) NOT NULL,
  `GenderName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gender`
--

INSERT INTO `gender` (`GenderID`, `GenderName`) VALUES
(1, 'Male'),
(2, 'Female');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `InventoryID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `InventoryDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventorydetails`
--

CREATE TABLE `inventorydetails` (
  `InventoryDetailsID` int(11) NOT NULL,
  `InventoryID` int(11) DEFAULT NULL,
  `ProductID` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `ExpirationDate` date DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventorydetails`
--

INSERT INTO `inventorydetails` (`InventoryDetailsID`, `InventoryID`, `ProductID`, `Quantity`, `ExpirationDate`, `Price`) VALUES
(20, NULL, 34, 107, NULL, 21.00);

-- --------------------------------------------------------

--
-- Table structure for table `inventorysnapshot`
--

CREATE TABLE `inventorysnapshot` (
  `InventorySnapshotID` int(11) NOT NULL,
  `SnapshotDate` datetime NOT NULL,
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventorysnapshot`
--

INSERT INTO `inventorysnapshot` (`InventorySnapshotID`, `SnapshotDate`, `ProductID`, `ProductName`, `Quantity`, `Price`) VALUES
(1, '2025-03-15 02:19:49', 30, 'testSubject', 50, 13.00),
(2, '2025-03-15 02:19:49', 34, 'testAddNo1', 50, 21.00),
(3, '2025-03-15 02:24:34', 30, 'testSubject', 50, 13.00),
(4, '2025-03-15 02:24:34', 34, 'testAddNo1', 50, 21.00);

-- --------------------------------------------------------

--
-- Table structure for table `inventorysummary`
--

CREATE TABLE `inventorysummary` (
  `InventorySummaryID` int(11) NOT NULL,
  `InventoryDetailsID` int(11) DEFAULT NULL,
  `SummaryDate` date NOT NULL,
  `BeginningInventory` int(11) DEFAULT NULL,
  `AdditionalInventory` int(11) DEFAULT NULL,
  `Transfer` int(11) DEFAULT NULL,
  `ClosingInventory` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventorysummary`
--

INSERT INTO `inventorysummary` (`InventorySummaryID`, `InventoryDetailsID`, `SummaryDate`, `BeginningInventory`, `AdditionalInventory`, `Transfer`, `ClosingInventory`) VALUES
(2, 20, '2025-03-15', 0, 0, 0, 50),
(4, 20, '2025-03-15', 0, 0, 0, 50),
(6, 20, '2025-03-15', 0, 0, 0, 50),
(8, 20, '2025-03-15', 50, 0, 0, 50),
(10, 20, '2025-03-15', 50, 0, 0, 50),
(12, 20, '2025-03-15', 50, 57, 0, 107),
(14, 20, '2025-03-15', 107, 0, 0, 107),
(16, 20, '2025-03-15', 107, 0, 0, 107),
(18, 20, '2025-03-15', 107, 0, 0, 107),
(20, 20, '2025-03-15', 107, 0, 0, 107),
(22, 20, '2025-03-15', 107, 0, 0, 107),
(24, 20, '2025-03-15', 107, 0, 0, 107),
(26, 20, '2025-03-15', 107, 0, 0, 107),
(28, 20, '2025-03-15', 107, 0, 0, 107),
(30, 20, '2025-03-15', 107, 0, 0, 107),
(32, 20, '2025-03-15', 107, 0, 0, 107),
(34, 20, '2025-03-16', 107, 0, 0, 107),
(36, 20, '2025-03-16', 107, 0, 0, 107);

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `ItemID` int(11) NOT NULL,
  `ItemName` varchar(100) NOT NULL,
  `Price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manager`
--

CREATE TABLE `manager` (
  `ManagerID` int(11) NOT NULL,
  `PersonID` int(11) DEFAULT NULL,
  `EffectiveDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `outlet`
--

CREATE TABLE `outlet` (
  `OutletID` int(11) NOT NULL,
  `OwnerID` int(11) DEFAULT NULL,
  `OutletName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `outlet`
--

INSERT INTO `outlet` (`OutletID`, `OwnerID`, `OutletName`) VALUES
(13, 10, 'Main Street Outlet'),
(14, 11, 'Downtown Outlet'),
(15, 12, 'Uptown Outlet');

-- --------------------------------------------------------

--
-- Table structure for table `owner`
--

CREATE TABLE `owner` (
  `OwnerID` int(11) NOT NULL,
  `PersonID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owner`
--

INSERT INTO `owner` (`OwnerID`, `PersonID`) VALUES
(10, 12),
(11, 13),
(12, 14);

-- --------------------------------------------------------

--
-- Table structure for table `person`
--

CREATE TABLE `person` (
  `PersonID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `GenderID` int(11) DEFAULT NULL,
  `CivilStatusID` int(11) DEFAULT NULL,
  `Name` varchar(100) NOT NULL,
  `Age` int(11) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Contact` varchar(50) DEFAULT NULL,
  `Position` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `person`
--

INSERT INTO `person` (`PersonID`, `Username`, `Password`, `GenderID`, `CivilStatusID`, `Name`, `Age`, `Address`, `Contact`, `Position`) VALUES
(1, 'testuser', 'testpass', NULL, NULL, 'Test User', NULL, NULL, NULL, NULL),
(3, 'alice_j', 'password123', 1, 1, 'Alice Johnson', 30, '123 Main St', '123-456-7890', 'Manager'),
(4, 'bob_s', 'password456', 1, 2, 'Bob Smith', 25, '456 Downtown Ave', '987-654-3210', 'Delivery Driver'),
(5, 'charlie_b', 'password789', 1, 1, 'Charlie Brown', 28, '789 Uptown Blvd', '555-555-5555', 'Warehouse Staff'),
(9, 'owner1', 'ownerpass1', 1, 1, 'John Doe', 40, '100 Business St', '111-222-3333', 'Owner'),
(10, 'owner2', 'ownerpass2', 1, 2, 'Jane Smith', 38, '200 Commerce Ave', '444-555-6666', 'Owner'),
(11, 'owner3', 'ownerpass3', 1, 1, 'Robert White', 45, '300 Trade Blvd', '777-888-9999', 'Owner'),
(12, 'outlet_manager1', 'outletpass1', 1, 1, 'Mike Johnson', 35, '101 Retail Rd', '123-987-6543', 'Outlet Manager'),
(13, 'outlet_manager2', 'outletpass2', 1, 2, 'Emily Davis', 33, '202 Shopping Ln', '321-654-9870', 'Outlet Manager'),
(14, 'outlet_manager3', 'outletpass3', 1, 1, 'Sarah Brown', 37, '303 Market St', '555-666-7777', 'Outlet Manager');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`ProductID`, `ProductName`, `Price`, `Quantity`) VALUES
(30, 'testSubject', 0.00, 0),
(34, 'testAddNo1', 0.00, 0),
(35, 'testSubject2', 0.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `ReportID` int(11) NOT NULL,
  `EmployeeID` int(11) DEFAULT NULL,
  `ReportDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reportdetails`
--

CREATE TABLE `reportdetails` (
  `ReportDetailsID` int(11) NOT NULL,
  `ReportID` int(11) DEFAULT NULL,
  `InventoryDetailsID` int(11) DEFAULT NULL,
  `QuantitySold` int(11) NOT NULL,
  `SpecialPrice` decimal(10,2) DEFAULT NULL,
  `Amount` decimal(10,2) DEFAULT NULL,
  `Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stockout`
--

CREATE TABLE `stockout` (
  `StockOutID` int(11) NOT NULL,
  `ReportID` int(11) DEFAULT NULL,
  `InventoryID` int(11) DEFAULT NULL,
  `StockOutDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `SupplierID` int(11) NOT NULL,
  `PersonID` int(11) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `ContactNo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`SupplierID`, `PersonID`, `Address`, `ContactNo`) VALUES
(1, 12, '12', '322'),
(3, 13, '12', '52477'),
(4, 14, '10', '456');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_inventory`
--

CREATE TABLE `supplier_inventory` (
  `SupplierInventoryID` int(11) NOT NULL,
  `SupplierID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `DeliveryDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier_inventory`
--

INSERT INTO `supplier_inventory` (`SupplierInventoryID`, `SupplierID`, `ProductID`, `Quantity`, `DeliveryDate`) VALUES
(1, 12, 30, 21, '2025-03-14 05:14:01'),
(2, 12, 30, 12, '2025-03-14 05:14:43'),
(3, 12, 30, 5, '2025-03-14 05:16:28'),
(4, 14, 30, 55, '2025-03-14 16:14:15');

-- --------------------------------------------------------

--
-- Table structure for table `supply`
--

CREATE TABLE `supply` (
  `SupplyID` int(11) NOT NULL,
  `SupplierID` int(11) DEFAULT NULL,
  `ManagerID` int(11) DEFAULT NULL,
  `SupplyDate` date NOT NULL,
  `Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplydetails`
--

CREATE TABLE `supplydetails` (
  `SupplyDetailsID` int(11) NOT NULL,
  `SupplyID` int(11) DEFAULT NULL,
  `ItemID` int(11) DEFAULT NULL,
  `Quantity` int(11) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_delivery_product_details`
-- (See below for the actual view)
--
CREATE TABLE `view_delivery_product_details` (
`DeliveryDetailsID` decimal(10,2)
,`DeliveryID` int(11)
,`ProductID` int(11)
,`ProductName` varchar(100)
,`DeliveredQuantity` int(11)
,`Quality` varchar(50)
,`Price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Structure for view `view_delivery_product_details`
--
DROP TABLE IF EXISTS `view_delivery_product_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`localhost` SQL SECURITY DEFINER VIEW `view_delivery_product_details`  AS SELECT `dd`.`DeliveryDetailsID` AS `DeliveryDetailsID`, `dd`.`DeliveryID` AS `DeliveryID`, `p`.`ProductID` AS `ProductID`, `p`.`ProductName` AS `ProductName`, `dd`.`DeliveredQuantity` AS `DeliveredQuantity`, `dd`.`Quality` AS `Quality`, `dd`.`Price` AS `Price` FROM (`deliverydetails` `dd` join `product` `p` on(`dd`.`ProductID` = `p`.`ProductID`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `civilstatus`
--
ALTER TABLE `civilstatus`
  ADD PRIMARY KEY (`CivilStatusID`);

--
-- Indexes for table `delivery`
--
ALTER TABLE `delivery`
  ADD PRIMARY KEY (`DeliveryID`),
  ADD KEY `EmployeeID` (`EmployeeID`),
  ADD KEY `OutletID` (`OutletID`);

--
-- Indexes for table `deliverydetails`
--
ALTER TABLE `deliverydetails`
  ADD PRIMARY KEY (`DeliveryDetailsID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `fk_deliverydetails_delivery` (`DeliveryID`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`EmployeeID`),
  ADD UNIQUE KEY `PersonID` (`PersonID`);

--
-- Indexes for table `gender`
--
ALTER TABLE `gender`
  ADD PRIMARY KEY (`GenderID`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`InventoryID`),
  ADD KEY `EmployeeID` (`EmployeeID`);

--
-- Indexes for table `inventorydetails`
--
ALTER TABLE `inventorydetails`
  ADD PRIMARY KEY (`InventoryDetailsID`),
  ADD KEY `InventoryID` (`InventoryID`),
  ADD KEY `ProductID` (`ProductID`);

--
-- Indexes for table `inventorysnapshot`
--
ALTER TABLE `inventorysnapshot`
  ADD PRIMARY KEY (`InventorySnapshotID`),
  ADD KEY `FK_InvSnapshot_Product` (`ProductID`);

--
-- Indexes for table `inventorysummary`
--
ALTER TABLE `inventorysummary`
  ADD PRIMARY KEY (`InventorySummaryID`),
  ADD KEY `InventoryDetailsID` (`InventoryDetailsID`);

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`ItemID`);

--
-- Indexes for table `manager`
--
ALTER TABLE `manager`
  ADD PRIMARY KEY (`ManagerID`),
  ADD UNIQUE KEY `PersonID` (`PersonID`);

--
-- Indexes for table `outlet`
--
ALTER TABLE `outlet`
  ADD PRIMARY KEY (`OutletID`),
  ADD KEY `OwnerID` (`OwnerID`);

--
-- Indexes for table `owner`
--
ALTER TABLE `owner`
  ADD PRIMARY KEY (`OwnerID`),
  ADD UNIQUE KEY `PersonID` (`PersonID`);

--
-- Indexes for table `person`
--
ALTER TABLE `person`
  ADD PRIMARY KEY (`PersonID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD KEY `GenderID` (`GenderID`),
  ADD KEY `CivilStatusID` (`CivilStatusID`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`ProductID`),
  ADD UNIQUE KEY `unique_product_name` (`ProductName`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`ReportID`),
  ADD KEY `EmployeeID` (`EmployeeID`);

--
-- Indexes for table `reportdetails`
--
ALTER TABLE `reportdetails`
  ADD PRIMARY KEY (`ReportDetailsID`),
  ADD KEY `ReportID` (`ReportID`),
  ADD KEY `InventoryDetailsID` (`InventoryDetailsID`);

--
-- Indexes for table `stockout`
--
ALTER TABLE `stockout`
  ADD PRIMARY KEY (`StockOutID`),
  ADD KEY `ReportID` (`ReportID`),
  ADD KEY `InventoryID` (`InventoryID`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`SupplierID`),
  ADD KEY `PersonID` (`PersonID`);

--
-- Indexes for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  ADD PRIMARY KEY (`SupplierInventoryID`),
  ADD KEY `FK_SupplierInventory_Supplier` (`SupplierID`),
  ADD KEY `FK_SupplierInventory_Product` (`ProductID`);

--
-- Indexes for table `supply`
--
ALTER TABLE `supply`
  ADD PRIMARY KEY (`SupplyID`),
  ADD KEY `SupplierID` (`SupplierID`),
  ADD KEY `ManagerID` (`ManagerID`);

--
-- Indexes for table `supplydetails`
--
ALTER TABLE `supplydetails`
  ADD PRIMARY KEY (`SupplyDetailsID`),
  ADD KEY `SupplyID` (`SupplyID`),
  ADD KEY `ItemID` (`ItemID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `civilstatus`
--
ALTER TABLE `civilstatus`
  MODIFY `CivilStatusID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `delivery`
--
ALTER TABLE `delivery`
  MODIFY `DeliveryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `gender`
--
ALTER TABLE `gender`
  MODIFY `GenderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `InventoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventorydetails`
--
ALTER TABLE `inventorydetails`
  MODIFY `InventoryDetailsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `inventorysnapshot`
--
ALTER TABLE `inventorysnapshot`
  MODIFY `InventorySnapshotID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventorysummary`
--
ALTER TABLE `inventorysummary`
  MODIFY `InventorySummaryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `ItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `manager`
--
ALTER TABLE `manager`
  MODIFY `ManagerID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `outlet`
--
ALTER TABLE `outlet`
  MODIFY `OutletID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `owner`
--
ALTER TABLE `owner`
  MODIFY `OwnerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `person`
--
ALTER TABLE `person`
  MODIFY `PersonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `ReportID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reportdetails`
--
ALTER TABLE `reportdetails`
  MODIFY `ReportDetailsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stockout`
--
ALTER TABLE `stockout`
  MODIFY `StockOutID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplier`
--
ALTER TABLE `supplier`
  MODIFY `SupplierID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  MODIFY `SupplierInventoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `supply`
--
ALTER TABLE `supply`
  MODIFY `SupplyID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplydetails`
--
ALTER TABLE `supplydetails`
  MODIFY `SupplyDetailsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery`
--
ALTER TABLE `delivery`
  ADD CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`) ON DELETE CASCADE,
  ADD CONSTRAINT `delivery_ibfk_2` FOREIGN KEY (`OutletID`) REFERENCES `outlet` (`OutletID`) ON DELETE CASCADE;

--
-- Constraints for table `deliverydetails`
--
ALTER TABLE `deliverydetails`
  ADD CONSTRAINT `deliverydetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`),
  ADD CONSTRAINT `fk_deliverydetails_delivery` FOREIGN KEY (`DeliveryID`) REFERENCES `delivery` (`DeliveryID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`PersonID`) REFERENCES `person` (`PersonID`) ON DELETE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`) ON DELETE CASCADE;

--
-- Constraints for table `inventorydetails`
--
ALTER TABLE `inventorydetails`
  ADD CONSTRAINT `inventorydetails_ibfk_1` FOREIGN KEY (`InventoryID`) REFERENCES `inventory` (`InventoryID`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventorydetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`) ON DELETE CASCADE;

--
-- Constraints for table `inventorysnapshot`
--
ALTER TABLE `inventorysnapshot`
  ADD CONSTRAINT `FK_InvSnapshot_Product` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventorysummary`
--
ALTER TABLE `inventorysummary`
  ADD CONSTRAINT `inventorysummary_ibfk_1` FOREIGN KEY (`InventoryDetailsID`) REFERENCES `inventorydetails` (`InventoryDetailsID`) ON DELETE CASCADE;

--
-- Constraints for table `manager`
--
ALTER TABLE `manager`
  ADD CONSTRAINT `manager_ibfk_1` FOREIGN KEY (`PersonID`) REFERENCES `person` (`PersonID`) ON DELETE CASCADE;

--
-- Constraints for table `outlet`
--
ALTER TABLE `outlet`
  ADD CONSTRAINT `outlet_ibfk_1` FOREIGN KEY (`OwnerID`) REFERENCES `owner` (`OwnerID`) ON DELETE CASCADE;

--
-- Constraints for table `owner`
--
ALTER TABLE `owner`
  ADD CONSTRAINT `owner_ibfk_1` FOREIGN KEY (`PersonID`) REFERENCES `person` (`PersonID`) ON DELETE CASCADE;

--
-- Constraints for table `person`
--
ALTER TABLE `person`
  ADD CONSTRAINT `person_ibfk_1` FOREIGN KEY (`GenderID`) REFERENCES `gender` (`GenderID`) ON DELETE SET NULL,
  ADD CONSTRAINT `person_ibfk_2` FOREIGN KEY (`CivilStatusID`) REFERENCES `civilstatus` (`CivilStatusID`) ON DELETE SET NULL;

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `employee` (`EmployeeID`) ON DELETE CASCADE;

--
-- Constraints for table `reportdetails`
--
ALTER TABLE `reportdetails`
  ADD CONSTRAINT `reportdetails_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `report` (`ReportID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reportdetails_ibfk_2` FOREIGN KEY (`InventoryDetailsID`) REFERENCES `inventorydetails` (`InventoryDetailsID`) ON DELETE CASCADE;

--
-- Constraints for table `stockout`
--
ALTER TABLE `stockout`
  ADD CONSTRAINT `stockout_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `report` (`ReportID`) ON DELETE CASCADE,
  ADD CONSTRAINT `stockout_ibfk_2` FOREIGN KEY (`InventoryID`) REFERENCES `inventory` (`InventoryID`) ON DELETE CASCADE;

--
-- Constraints for table `supplier`
--
ALTER TABLE `supplier`
  ADD CONSTRAINT `supplier_ibfk_1` FOREIGN KEY (`PersonID`) REFERENCES `person` (`PersonID`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_inventory`
--
ALTER TABLE `supplier_inventory`
  ADD CONSTRAINT `FK_SupplierInventory_Product` FOREIGN KEY (`ProductID`) REFERENCES `product` (`ProductID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_SupplierInventory_Supplier` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`PersonID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supply`
--
ALTER TABLE `supply`
  ADD CONSTRAINT `supply_ibfk_1` FOREIGN KEY (`SupplierID`) REFERENCES `supplier` (`SupplierID`) ON DELETE CASCADE,
  ADD CONSTRAINT `supply_ibfk_2` FOREIGN KEY (`ManagerID`) REFERENCES `manager` (`ManagerID`) ON DELETE CASCADE;

--
-- Constraints for table `supplydetails`
--
ALTER TABLE `supplydetails`
  ADD CONSTRAINT `supplydetails_ibfk_1` FOREIGN KEY (`SupplyID`) REFERENCES `supply` (`SupplyID`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplydetails_ibfk_2` FOREIGN KEY (`ItemID`) REFERENCES `item` (`ItemID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
