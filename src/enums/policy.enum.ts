export enum Policy {
  // Admin
  Admin = '*.*',
  // Auth
  Auth = 'auth.*',
  AuthLogin = 'auth.login',
  // User
  UserGetMany = 'users.getMany',
  UserGetById = 'users.getById',
  // Role
  Role = 'role.*',
  RoleGetById = 'role.getById',
  // Sale
  Sale = 'sale.*',
  SaleGetById = 'sale.getById',
  // Shop
  Shop = 'shop.*',
  ShopGetById = 'shop.getById',
  // Product
  Product = 'product.*',
  ProductGetById = 'product.getById',
  // Orderline
  Orderline = 'orderline.*',
  OrderlineGetById = 'orderline.getById',
  // StockLevel
  StockLevel = 'stockLevel.*',
  StockLevelGetById = 'stockLevel.getById',
  // Transaction\
  Transaction = 'transaction.*',
  TransactionGetById = 'transaction.getById',
  // Organization
  Organization = 'organization.*',
  OrganizationGetById = 'organization.getById',
  // ProductGroup
  ProductGroup = 'productGroup.*',
  ProductGroupGetById = 'productGroup.getById',
}
