-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_fkey`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userName` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `roleId` INTEGER NULL,
    `userStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(255) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    INDEX `RefreshToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResetToken` (
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ResetToken_token_key`(`token`),
    INDEX `ResetToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailVerificationToken` (
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EmailVerificationToken_token_key`(`token`),
    INDEX `EmailVerificationToken_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductLabel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productLabelName` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `productLabelStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(255) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productCollectionName` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `productCollectionStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(255) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductTags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productTagsName` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `productPermalink` VARCHAR(255) NOT NULL,
    `productTagsStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(255) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,
    `roleStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',

    UNIQUE INDEX `Roles_roleName_key`(`roleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `moduleName` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `flag` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `permissionsStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(255) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `content` LONGTEXT NULL,
    `status` VARCHAR(60) NOT NULL DEFAULT 'published',
    `images` TEXT NULL,
    `sku` VARCHAR(191) NULL,
    `order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `quantity` INTEGER UNSIGNED NULL,
    `allowCheckoutWhenOutOfStock` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `withStorehouseManagement` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `isFeatured` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `brandId` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `isVariation` TINYINT NOT NULL DEFAULT 0,
    `saleType` TINYINT NOT NULL DEFAULT 0,
    `price` DOUBLE NULL,
    `salePrice` DOUBLE NULL,
    `startDate` TIMESTAMP(0) NULL,
    `endDate` TIMESTAMP(0) NULL,
    `length` DOUBLE NULL,
    `wide` DOUBLE NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `taxId` INTEGER UNSIGNED NULL DEFAULT 0,
    `views` INTEGER UNSIGNED NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NULL,
    `updatedAt` TIMESTAMP(0) NULL,
    `stockStatus` VARCHAR(191) NULL DEFAULT 'in_stock',
    `storeId` INTEGER UNSIGNED NOT NULL,
    `createdById` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `createdByType` VARCHAR(191) NULL,
    `approvedBy` INTEGER UNSIGNED NULL DEFAULT 0,
    `image` VARCHAR(191) NULL,
    `productType` VARCHAR(60) NULL DEFAULT 'physical',
    `barcode` VARCHAR(50) NULL,
    `costPerItem` DOUBLE NULL,
    `generateLicenseCode` BOOLEAN NOT NULL DEFAULT false,
    `minimumOrderQuantity` INTEGER UNSIGNED NULL DEFAULT 0,
    `maximumOrderQuantity` INTEGER UNSIGNED NULL DEFAULT 0,
    `addons` TEXT NULL,
    `discountName` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `financialYear` VARCHAR(100) NOT NULL,
    `status` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `financialYear` VARCHAR(100) NOT NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `invoiceNumber` VARCHAR(100) NOT NULL,
    `storeId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productAttrId` INTEGER NOT NULL,
    `openingstock` INTEGER NOT NULL DEFAULT 0,
    `received` INTEGER NOT NULL DEFAULT 0,
    `issued` INTEGER NOT NULL DEFAULT 0,
    `returned` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    UNIQUE INDEX `StockRecord_productId_storeId_financialYear_productAttrId_key`(`productId`, `storeId`, `financialYear`, `productAttrId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockRecordId` INTEGER NOT NULL,
    `inventoryId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `financialYear` VARCHAR(100) NOT NULL,
    `vendorName` VARCHAR(100) NOT NULL,
    `variationName` VARCHAR(100) NULL,
    `productId` INTEGER NOT NULL,
    `productAttrId` INTEGER NOT NULL,
    `amount` DOUBLE NULL,
    `attributePrice` DOUBLE NULL,
    `attributeSalePrice` DOUBLE NULL,
    `received` INTEGER NULL DEFAULT 0,
    `receivedDate` DATETIME(3) NULL,
    `issued` INTEGER NULL DEFAULT 0,
    `issuedDate` DATETIME(3) NULL,
    `returned` INTEGER NULL DEFAULT 0,
    `returnedDate` DATETIME(3) NULL,
    `status` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceDate` DATETIME(3) NOT NULL,
    `invoiceNumber` VARCHAR(100) NOT NULL,
    `inventoryAmount` DOUBLE NOT NULL,
    `customCharges` DOUBLE NULL,
    `shippingCharges` DOUBLE NULL,
    `otherCharges` DOUBLE NULL,
    `status` ENUM('pending', 'closed') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryId` INTEGER NOT NULL,
    `partialAmount` DOUBLE NOT NULL,
    `usdAmount` DOUBLE NULL,
    `inrAmount` DOUBLE NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `productAttrId` INTEGER NOT NULL DEFAULT 0,

    INDEX `CartItem_cartId_fkey`(`cartId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favourite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavouriteItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `favId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    INDEX `FavouriteItem_favId_fkey`(`favId`),
    INDEX `FavouriteItem_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(255) NOT NULL,
    `storeUrl` VARCHAR(255) NOT NULL,
    `storeEmail` VARCHAR(255) NOT NULL,
    `storePhone` VARCHAR(20) NOT NULL,
    `storeDesc` TEXT NOT NULL,
    `storeContent` TEXT NOT NULL,
    `storeCountry` VARCHAR(255) NOT NULL,
    `storeState` VARCHAR(255) NOT NULL,
    `storeCity` VARCHAR(255) NOT NULL,
    `storeAddress` VARCHAR(255) NOT NULL,
    `storeCompany` VARCHAR(255) NOT NULL,
    `storeStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `storeOwner` VARCHAR(255) NOT NULL,
    `storeLogo` TEXT NULL,
    `storeImages` TEXT NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    UNIQUE INDEX `storeName`(`storeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `countryName` VARCHAR(191) NOT NULL,
    `countryIso` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `countryStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Countries_countryName_key`(`countryName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `States` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stateName` VARCHAR(191) NOT NULL,
    `stateShortName` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `stateStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,

    UNIQUE INDEX `States_stateName_key`(`stateName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cityName` VARCHAR(191) NOT NULL,
    `cityShortName` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `stateId` INTEGER NOT NULL,
    `cityStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Cities_cityName_key`(`cityName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssignPermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissions` TEXT NOT NULL,
    `assignStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,

    UNIQUE INDEX `AssignPermissions_roleId_key`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `zipCode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `shippingAddress` VARCHAR(191) NOT NULL,
    `updateAt` DATETIME(3) NULL,
    `updateBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `autoOrderId` VARCHAR(191) NULL,
    `billingInfoId` INTEGER NOT NULL,
    `paymentInfoId` INTEGER NOT NULL,
    `deliveryCharges` DOUBLE NULL,
    `couponId` INTEGER NULL,
    `couponCode` VARCHAR(100) NULL,
    `totalAmount` DOUBLE NOT NULL,
    `paymentMethod` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `couponOptions` VARCHAR(100) NULL,
    `couponType` VARCHAR(100) NULL,
    `couponValue` VARCHAR(100) NULL,
    `orderStatus` ENUM('pending', 'processed', 'cancelled') NOT NULL DEFAULT 'pending',
    `itemStatus` ENUM('pending', 'processed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `processed_date` DATETIME(0) NULL,
    `shipped_date` DATETIME(0) NULL,
    `delivered_date` DATETIME(0) NULL,
    `cancelled_date` DATETIME(0) NULL,

    INDEX `itemOrder_billingInfoId_idx`(`billingInfoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productAttrId` INTEGER NOT NULL,
    `productName` VARCHAR(100) NOT NULL,
    `productImage` VARCHAR(100) NOT NULL,
    `productPrice` DOUBLE NOT NULL,
    `productSalePrice` DOUBLE NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `financialYear` VARCHAR(100) NULL,
    `storeId` INTEGER UNSIGNED NOT NULL,
    `orderDetailStatus` ENUM('pending', 'processed', 'cancelled') NOT NULL DEFAULT 'pending',
    `itemDetailStatus` ENUM('pending', 'processed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `couponCode` VARCHAR(255) NOT NULL,
    `couponDesc` TEXT NOT NULL,
    `couponStartDate` TEXT NOT NULL,
    `couponEndDate` TEXT NOT NULL,
    `couponType` VARCHAR(255) NOT NULL,
    `couponOptions` VARCHAR(255) NOT NULL,
    `couponValue` VARCHAR(255) NOT NULL,
    `isNeverExpired` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,
    `couponStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',

    UNIQUE INDEX `couponCode`(`couponCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CouponsUserAdd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `couponId` INTEGER NOT NULL,
    `couponCode` TEXT NOT NULL,
    `userId` TEXT NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageName` VARCHAR(191) NOT NULL,
    `pageContent` TEXT NOT NULL,
    `pageStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductAttributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeName` VARCHAR(191) NOT NULL,
    `attributeDesc` TEXT NOT NULL,
    `attributeStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `attributeContent` TEXT NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductBrands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `brandName` VARCHAR(191) NOT NULL,
    `brandDesc` TEXT NOT NULL,
    `brandWebsite` VARCHAR(191) NOT NULL,
    `brandStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `brandOrder` INTEGER NOT NULL,
    `brandImage` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryName` VARCHAR(191) NOT NULL,
    `categoryDisplayName` VARCHAR(191) NOT NULL,
    `parentId` INTEGER NOT NULL,
    `categoryDesc` TEXT NOT NULL,
    `categoryStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `menuDisplay` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `categoryOrder` INTEGER NOT NULL,
    `categoryImage` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentTransactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paySessionId` VARCHAR(191) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `payContent` TEXT NULL,
    `payStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Taxes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NULL,
    `priority` INTEGER NULL,
    `taxStatus` ENUM('active', 'inactive', 'pending', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(100) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductReviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reviewer` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `reviewStatus` ENUM('pending', 'publish', 'delete') NOT NULL DEFAULT 'pending',
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWithAttribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeContent` TEXT NULL,
    `productId` INTEGER NOT NULL,
    `attributePrice` DOUBLE NULL,
    `attributeSalePrice` DOUBLE NULL,
    `images` TEXT NULL,
    `attributeSku` VARCHAR(100) NULL,
    `attributeCostPerItem` DOUBLE NULL,
    `attributebarcode` VARCHAR(50) NULL,
    `allowCheckoutWhenOutOfStock` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `withStorehouseManagement` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `attributeQuantity` INTEGER UNSIGNED NULL,
    `attributelength` DOUBLE NULL,
    `attributewide` DOUBLE NULL,
    `attributeheight` DOUBLE NULL,
    `attributeweight` DOUBLE NULL,
    `couponStartDate` TEXT NULL,
    `couponEndDate` TEXT NULL,
    `status` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `isDefault` ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWithLabel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labelId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `status` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWithCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `status` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWithCollection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collectionId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `status` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWithTags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tagId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `status` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    UNIQUE INDEX `ProductWithTags_productId_tagId_key`(`productId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HomeBanners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bannerName` VARCHAR(191) NOT NULL,
    `bannerDesc` VARCHAR(191) NULL,
    `bannerLink` VARCHAR(191) NULL,
    `bannerImages` TEXT NULL,
    `bannerPositions` ENUM('slider', 'ads1', 'ads2', 'ads3', 'ads4', 'ads5', 'ads6', 'ads7', 'ads8', 'ads9', 'ads10') NOT NULL DEFAULT 'slider',
    `bannerStatus` ENUM('pending', 'active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationName` VARCHAR(191) NOT NULL,
    `notificationOrder` VARCHAR(191) NOT NULL,
    `notificationStatus` ENUM('active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerRatings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerName` VARCHAR(191) NOT NULL,
    `customerCategory` VARCHAR(191) NOT NULL,
    `customerRating` INTEGER NOT NULL,
    `customerDescription` TEXT NULL,
    `customerStatus` ENUM('active', 'delete') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(0) NULL,
    `createdBy` VARCHAR(100) NULL,
    `updateAt` DATETIME(0) NULL,
    `updateBy` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResetToken` ADD CONSTRAINT `ResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailVerificationToken` ADD CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockRecord` ADD CONSTRAINT `StockRecord_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockRecord` ADD CONSTRAINT `StockRecord_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Stores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockDetail` ADD CONSTRAINT `StockDetail_stockRecordId_fkey` FOREIGN KEY (`stockRecordId`) REFERENCES `StockRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryDetails` ADD CONSTRAINT `InventoryDetails_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteItem` ADD CONSTRAINT `FavouriteItem_favId_fkey` FOREIGN KEY (`favId`) REFERENCES `Favourite`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavouriteItem` ADD CONSTRAINT `FavouriteItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `States` ADD CONSTRAINT `States_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cities` ADD CONSTRAINT `Cities_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cities` ADD CONSTRAINT `Cities_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `States`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignPermissions` ADD CONSTRAINT `AssignPermissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemOrder` ADD CONSTRAINT `itemOrder_billingInfoId_fkey` FOREIGN KEY (`billingInfoId`) REFERENCES `BillingInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `itemOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithAttribute` ADD CONSTRAINT `ProductWithAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithLabel` ADD CONSTRAINT `ProductWithLabel_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithCategory` ADD CONSTRAINT `ProductWithCategory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithCollection` ADD CONSTRAINT `ProductWithCollection_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithTags` ADD CONSTRAINT `ProductWithTags_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithTags` ADD CONSTRAINT `ProductWithTags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `ProductTags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
