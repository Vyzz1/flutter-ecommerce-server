Chắc chắn rồi! Hãy cùng xem một ví dụ **cụ thể hơn** về cách bạn có thể sử dụng cơ sở dữ liệu để quản lý các biến thể sản phẩm (với các thuộc tính như **Màu sắc**, **RAM**, **Ổ cứng**) và đi kèm với **giá** và **số lượng tồn kho** cho mỗi biến thể này.

### Giả sử bạn có sản phẩm **"Laptop XYZ"** với các thuộc tính và biến thể sau:

- **Màu sắc**: Đen, Trắng
- **RAM**: 8GB, 16GB
- **Ổ cứng**: SSD 512GB, SSD 1TB

Bạn sẽ quản lý các **biến thể sản phẩm** này với các thông tin về **giá** và **số lượng tồn kho** riêng biệt cho mỗi biến thể.

### Cấu trúc cơ sở dữ liệu

#### 1. **Bảng `Products`**: Lưu thông tin chung về sản phẩm (không chứa giá và số lượng vì mỗi biến thể sẽ có giá và số lượng riêng).

```sql
CREATE TABLE Products (
    ProductID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    CategoryID INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **Bảng `Attributes`**: Lưu các thuộc tính có thể có cho sản phẩm (ví dụ: "Màu sắc", "RAM", "Ổ cứng").

```sql
CREATE TABLE Attributes (
    AttributeID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL  -- Ví dụ: "Màu sắc", "RAM", "Ổ cứng"
);
```

#### 3. **Bảng `AttributeValues`**: Lưu các giá trị của từng thuộc tính (ví dụ: "Đen", "Trắng", "8GB", "16GB").

```sql
CREATE TABLE AttributeValues (
    ValueID INT PRIMARY KEY AUTO_INCREMENT,
    AttributeID INT,  -- Liên kết với bảng Attributes
    Value VARCHAR(255) NOT NULL,  -- Ví dụ: "Đen", "16GB", "512GB SSD"
    FOREIGN KEY (AttributeID) REFERENCES Attributes(AttributeID)
);
```

#### 4. **Bảng `ProductVariants`**: Lưu thông tin về các biến thể của sản phẩm với **giá** và **số lượng tồn kho** riêng biệt.

```sql
CREATE TABLE ProductVariants (
    VariantID INT PRIMARY KEY AUTO_INCREMENT,
    ProductID INT,  -- Liên kết với bảng Products
    VariantName VARCHAR(255),  -- Tên biến thể (ví dụ: "Laptop XYZ - Đen, 8GB RAM, SSD 512GB")
    Price DECIMAL(10, 2),  -- Giá của biến thể
    Stock INT,  -- Số lượng tồn kho của biến thể
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
```

#### 5. **Bảng `ProductVariantAttributes`**: Liên kết các thuộc tính và giá trị của thuộc tính với biến thể sản phẩm.

```sql
CREATE TABLE ProductVariantAttributes (
    VariantID INT,  -- Liên kết với bảng ProductVariants
    AttributeID INT,  -- Liên kết với bảng Attributes
    ValueID INT,  -- Liên kết với bảng AttributeValues
    PRIMARY KEY (VariantID, AttributeID),
    FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID),
    FOREIGN KEY (AttributeID) REFERENCES Attributes(AttributeID),
    FOREIGN KEY (ValueID) REFERENCES AttributeValues(ValueID)
);
```

---

### Ví dụ Cụ thể về Các Dữ Liệu

#### Bước 1: Thêm sản phẩm vào bảng `Products`

```sql
INSERT INTO Products (Name, Description)
VALUES ('Laptop XYZ', 'Laptop mạnh mẽ, phù hợp với dân văn phòng');
```

#### Bước 2: Thêm các thuộc tính vào bảng `Attributes`

```sql
INSERT INTO Attributes (Name)
VALUES ('Màu sắc'), ('RAM'), ('Ổ cứng');
```

#### Bước 3: Thêm các giá trị thuộc tính vào bảng `AttributeValues`

```sql
-- Màu sắc
INSERT INTO AttributeValues (AttributeID, Value)
VALUES (1, 'Đen'), (1, 'Trắng');

-- RAM
INSERT INTO AttributeValues (AttributeID, Value)
VALUES (2, '8GB'), (2, '16GB');

-- Ổ cứng
INSERT INTO AttributeValues (AttributeID, Value)
VALUES (3, 'SSD 512GB'), (3, 'SSD 1TB');
```

#### Bước 4: Thêm các biến thể sản phẩm vào bảng `ProductVariants` với **giá** và **số lượng tồn kho** riêng biệt

```sql
-- Laptop XYZ - Đen, 8GB RAM, SSD 512GB
INSERT INTO ProductVariants (ProductID, VariantName, Price, Stock)
VALUES (1, 'Laptop XYZ - Đen, 8GB RAM, SSD 512GB', 15000000, 10);

-- Laptop XYZ - Đen, 16GB RAM, SSD 512GB
INSERT INTO ProductVariants (ProductID, VariantName, Price, Stock)
VALUES (1, 'Laptop XYZ - Đen, 16GB RAM, SSD 512GB', 16000000, 5);

-- Laptop XYZ - Trắng, 8GB RAM, SSD 512GB
INSERT INTO ProductVariants (ProductID, VariantName, Price, Stock)
VALUES (1, 'Laptop XYZ - Trắng, 8GB RAM, SSD 512GB', 15000000, 8);

-- Laptop XYZ - Trắng, 16GB RAM, SSD 1TB
INSERT INTO ProductVariants (ProductID, VariantName, Price, Stock)
VALUES (1, 'Laptop XYZ - Trắng, 16GB RAM, SSD 1TB', 17000000, 3);
```

#### Bước 5: Liên kết các thuộc tính với biến thể trong bảng `ProductVariantAttributes`

```sql
-- Laptop XYZ - Đen, 8GB RAM, SSD 512GB
INSERT INTO ProductVariantAttributes (VariantID, AttributeID, ValueID)
VALUES (1, 1, 1),  -- Màu sắc: Đen
       (1, 2, 1),  -- RAM: 8GB
       (1, 3, 1);  -- Ổ cứng: SSD 512GB

-- Laptop XYZ - Đen, 16GB RAM, SSD 512GB
INSERT INTO ProductVariantAttributes (VariantID, AttributeID, ValueID)
VALUES (2, 1, 1),  -- Màu sắc: Đen
       (2, 2, 2),  -- RAM: 16GB
       (2, 3, 1);  -- Ổ cứng: SSD 512GB

-- Laptop XYZ - Trắng, 8GB RAM, SSD 512GB
INSERT INTO ProductVariantAttributes (VariantID, AttributeID, ValueID)
VALUES (3, 1, 2),  -- Màu sắc: Trắng
       (3, 2, 1),  -- RAM: 8GB
       (3, 3, 1);  -- Ổ cứng: SSD 512GB

-- Laptop XYZ - Trắng, 16GB RAM, SSD 1TB
INSERT INTO ProductVariantAttributes (VariantID, AttributeID, ValueID)
VALUES (4, 1, 2),  -- Màu sắc: Trắng
       (4, 2, 2),  -- RAM: 16GB
       (4, 3, 2);  -- Ổ cứng: SSD 1TB
```

### Kết quả

Sau khi thực hiện các bước trên, bạn sẽ có các biến thể sản phẩm với các **giá** và **số lượng tồn kho** riêng biệt:

1. **Laptop XYZ - Đen, 8GB RAM, SSD 512GB**

   - Giá: 15,000,000 VNĐ
   - Tồn kho: 10 chiếc

2. **Laptop XYZ - Đen, 16GB RAM, SSD 512GB**

   - Giá: 16,000,000 VNĐ
   - Tồn kho: 5 chiếc

3. **Laptop XYZ - Trắng, 8GB RAM, SSD 512GB**

   - Giá: 15,000,000 VNĐ
   - Tồn kho: 8 chiếc

4. **Laptop XYZ - Trắng, 16GB RAM, SSD 1TB**
   - Giá: 17,000,000 VNĐ
   - Tồn kho: 3 chiếc

Như vậy, bạn có thể dễ dàng quản lý các **biến thể sản phẩm** với các **giá** và **số lượng tồn kho** khác nhau, đồng thời mỗi biến thể có thể có nhiều **thuộc tính** khác nhau như màu sắc, dung lượng RAM, và ổ cứng.

Mô hình này giúp bạn dễ dàng mở rộng và quản lý các sản phẩm và biến thể mà không cần thay đổi cấu trúc cơ sở dữ liệu khi có thêm sản phẩm mới hoặc thêm các thuộc tính mới.
