## Considerations

##### How to implement Tenant functionality with decorators

```ts
 @OrganizationContext()
 @ShopContext()
 @UserContext()
 getManyWithCount() {

 }
```

#### Problem
user 1 (organization auth) access data through site, only wants to consider data relevant to the current organization/shop cotnext

user 2 (regular auth) wants to see general data in a organization agnostic context

#####
Solution 1:
```ts
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OrganizationSpecific()
  @Column()
  barcode: string

  @Column()
  price: number;
}

@OrganizationContext() 
export class ProductRepository extends Repository<Product> {
  @PrimaryGeneratedColumn()
  id: number;

  @OrganizationSpecific()
  @Column()
  barcode: string

  @Column()
  price: number;
}
```

