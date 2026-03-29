-- AddForeignKey
ALTER TABLE `ProductCategories` ADD CONSTRAINT `ProductCategories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ProductCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWithCategory` ADD CONSTRAINT `ProductWithCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
