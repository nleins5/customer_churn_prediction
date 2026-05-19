
## Hướng Dẫn Cài Đặt

### 1. Tạo Môi Trường Ảo (Virtual Environment)

#### Trên Windows (PowerShell):
```powershell
# Tạo môi trường ảo tên "venv"
python -m venv venv

# Kích hoạt môi trường ảo
.\venv\Scripts\Activate.ps1
```

#### Trên macOS/Linux:
```bash
# Tạo môi trường ảo tên "venv"
python3 -m venv venv

# Kích hoạt môi trường ảo
source venv/bin/activate
```

### 2. Cài Đặt Các Thư Viện Cần Thiết

**Sau khi kích hoạt môi trường ảo**, chạy lệnh:
```bash
pip install -r requirements.txt
```
### 3. Xác Nhận Cài Đặt

Để kiểm tra xem các thư viện đã cài đặt thành công chưa:
```bash
pip list
```
### Đăng ký kernel
```bash
python -m ipykernel install --user --name venv_kernel --display-name "Python (venv)"
```
 Kích hoạt kernel bằng select kernel