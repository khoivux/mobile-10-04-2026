## Kiến trúc: Vertical Slice MVC

Dự án chia theo FEATURE, không chia theo layer:
```
src/features/{feature-name}/
  ├── models/      ← Thao tác SQLite
  ├── controllers/ ← Business logic
  ├── screens/     ← UI màn hình
  └── components/  ← UI components nhỏ
```

## Convention bắt buộc

### Comment đầu file:
`// @feature {name} | @layer {Model|Controller|Screen|Component}`

### Async/await + try-catch:
Dùng cấu trúc chuẩn:
```js
async myMethod(param) {
  try {
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
```

### Model pattern:
Transactions SQLite return by Promise resolution `(_, result)`. Từ chối `(_, err) => { reject(err); return false; }`.

### Controller pattern:
- Không có SQLite trong controller
- Không có JSX trong controller

### Screen pattern:
- Không có SQLite trong screen
- Dùng Controller để lấy data
- useFocusEffect để refresh khi navigate trở lại
- dispatch context để sync global state

## Database: thêm bảng mới
1. Thêm CREATE TABLE vào `src/core/db.js` (trong initDatabase)
2. Thêm seed data vào `seedData()`
3. Tạo Model mới trong feature tương ứng
4. KHÔNG tạo `db.js` riêng trong feature

## Known Gotchas
- expo-sqlite: executeSql callback phải return false trong error handler
- AsyncStorage là async — luôn await
- Intl.NumberFormat hoạt động trên Expo Go

## Data Flow theo MVC
- **Model Layer**: Xử lý 100% queries SQL (`SELECT`, `INSERT`, `UPDATE`), được bao bọc (wrapped) trong `Promise` để giữ tính bất đồng bộ.
- **Controller Layer**: Liên kết giữa UI và Model. Gọi Models để lấy/xử lý/transform dữ liệu (ví dụ format giá tiền, lọc danh sách), trước khi đưa sang Screen.
- **Screen/Component Layer**: Không thực thi SQL trực tiếp, cũng không gọi `AsyncStorage` để set login states (Screen nên nhường lại cho Controller). Chỉ phụ trách render và update Local State/Context.

## Integration Points giữa các Feature
- **ProductDetailScreen (catalog) → CartController (cart)**: Screen thuộc Catalog nhưng gọi `CartController.addToCart()` của feature Cart để đổ lượng sản phẩm mua.
- **CartScreen (cart) → InvoiceDetailScreen (invoice)**: Sau khi thanh toán thành công, nó gửi payload `invoice` ngay sang cho trang Invoice Detail.
- **InvoiceListScreen (invoice) → InvoiceDetailScreen**: Truyền qua `orderId`, bắt hệ thống call ngược DB trong component InvoiceDetailScreen.