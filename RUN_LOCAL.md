# 🛠️ Hướng dẫn Khởi chạy Ứng dụng Cục bộ (Local Run Guide)

Tài liệu này hướng dẫn chi tiết cách cài đặt và chạy toàn bộ ứng dụng **Customer Churn Prediction** (bao gồm Pipeline ML, Backend API, và Frontend React) trên máy tính cá nhân để phát triển và kiểm thử.

---

## 📌 Tổng quan các bước thực hiện
1. **Chuẩn bị dữ liệu**: Tải xuống dataset từ Kaggle.
2. **Cài đặt & Chạy Pipeline ML**: Thiết lập môi trường Python, huấn luyện mô hình để tạo ra các artifacts cần thiết.
3. **Chạy Backend API**: Khởi chạy FastAPI server trên cổng `8002`.
4. **Chạy Frontend**: Cài đặt thư viện Node.js và khởi chạy giao diện React.

---

## 1. Chuẩn bị Dữ liệu (Dataset)
Vì các file dữ liệu lớn và các file mô hình huấn luyện (.joblib, .npz) bị Git bỏ qua (.gitignore), bạn cần chuẩn bị dữ liệu thô ban đầu:
1. Tạo một thư mục tên là `data` ở thư mục gốc của dự án nếu chưa có.
2. Tải file dataset **`playground-series-s6e3.zip`** từ cuộc thi Kaggle Playground Series S6E3.
3. Đặt file zip đó vào thư mục `data/` như sau:
   ```text
   customer_churn_prediction/
   └── data/
       └── playground-series-s6e3.zip
   ```

---

## 2. Thiết lập Môi trường & Chạy Pipeline ML
Bạn cần chạy pipeline để tạo ra các file tiền xử lý (`preprocessor.joblib`) và mô hình LightGBM/XGBoost (`model.joblib`).

### 💻 Thực hiện trên Terminal (Mac/Linux) hoặc CMD/PowerShell (Windows)

#### Bước 2.1: Tạo và kích hoạt Môi trường ảo (Virtual Environment)
```bash
# Di chuyển vào thư mục gốc của dự án
cd customer_churn_prediction

# Tạo môi trường ảo python
python3 -m venv venv

# Kích hoạt môi trường ảo:
# Trên Mac/Linux:
source venv/bin/activate
# Trên Windows (Command Prompt):
venv\Scripts\activate
# Trên Windows (PowerShell):
.\venv\Scripts\Activate.ps1
```

#### Bước 2.2: Cài đặt các thư viện Python cần thiết
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Bước 2.3: Chạy Pipeline để huấn luyện mô hình
Chạy script `main.py` ở thư mục gốc để thực hiện toàn bộ 6 bước từ giải nén, kiểm tra dữ liệu, tiền xử lý, huấn luyện và đánh giá mô hình:
```bash
python main.py
```
*   *Thời gian chạy:* Khoảng 5-15 phút tùy cấu hình máy (do chạy Grid Search để tìm tham số tối ưu).
*   *Kết quả:* Các thư mục trong `artifacts/` sẽ được tự động tạo và chứa đầy đủ mô hình đã huấn luyện.

---

## 3. Khởi chạy Backend API (FastAPI)
Sau khi đã có mô hình trong thư mục `artifacts/`, bạn có thể khởi chạy API server.

1. Đảm bảo bạn đang ở thư mục gốc của dự án và môi trường ảo Python đã được kích hoạt.
2. Chạy lệnh sau để khởi động server trên cổng **`8002`** (đây là cổng mặc định mà Frontend sẽ gọi):
   ```bash
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8002
   ```
3. **Kiểm tra hoạt động:**
   * Truy cập `http://localhost:8002/` trên trình duyệt để kiểm tra trạng thái API (nếu hiển thị `{"status": "ok", ...}` là thành công).
   * Xem tài liệu API tương tác (Swagger UI) tại: `http://localhost:8002/docs`.

---

## 4. Khởi chạy Giao diện Frontend (React)
Frontend được xây dựng bằng React và kết nối trực tiếp với Backend cục bộ thông qua cổng `8002`.

#### Bước 4.1: Di chuyển vào thư mục frontend & Cài đặt Node modules
Yêu cầu máy tính đã cài đặt **Node.js** (Khuyên dùng phiên bản LTS v18 trở lên).
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các dependencies (sử dụng --legacy-peer-deps để tránh xung đột phiên bản React 19)
npm install --legacy-peer-deps
```

#### Bước 4.2: Cấu hình biến môi trường
File cấu hình cục bộ `frontend/.env.local` đã được cấu hình sẵn để kết nối với backend chạy ở localhost:
```env
REACT_APP_API_URL=http://localhost:8002
```
Nếu bạn chạy backend ở cổng khác, hãy chỉnh sửa giá trị này trong file `frontend/.env.local`.

#### Bước 4.3: Khởi chạy Frontend React
```bash
npm start
```
*   Ứng dụng sẽ tự động mở trên trình duyệt tại địa chỉ: **`http://localhost:3000`**
*   Giờ đây, bạn có thể thực hiện EDA, Huấn luyện mô hình từ giao diện, so sánh các tham số và chạy dự báo Churn trực quan hoàn toàn cục bộ!
