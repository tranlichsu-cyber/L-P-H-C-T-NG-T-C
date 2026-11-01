# Nguồn dữ liệu địa lí và ảnh địa cầu

- `vietnam-coastline.json`: phần đất liền lớn nhất của Việt Nam từ **Natural Earth 1:50m Admin 0 Countries**. Nguồn: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson . Natural Earth công bố dữ liệu ở phạm vi công cộng: https://www.naturalearthdata.com/about/terms-of-use/ . Đường bao gồm cả biên giới đất liền, không chỉ đường bờ biển; không mô tả ranh giới biển.
- `world-land.json`: hình học các quốc gia, đã bỏ thuộc tính, từ **Natural Earth 1:110m Admin 0 Countries**: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson . Dùng làm hình đất liền dự phòng của địa cầu, không vẽ ranh giới chính trị.
- `../textures/earth-blue-marble.jpg`: ảnh Blue Marble trong ví dụ dự án **three-globe** (MIT), https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg . Giấy phép dự án: https://github.com/vasturiano/three-globe/blob/master/LICENSE .
- `../textures/earth-clouds.png`: ảnh mây trong **Three.js r128**, https://github.com/mrdoob/three.js/blob/r128/examples/textures/planets/earth_clouds_1024.png . Giấy phép dự án: https://github.com/mrdoob/three.js/blob/r128/LICENSE .

Tải ngày 01/11/2026 qua HTTPS có kiểm tra TLS, lưu cùng dự án để chạy không cần máy chủ ngoài. File `SHA256SUMS` ghi nhận checksum của các tài nguyên đã lưu.

Độ cao trong sa bàn Việt Nam là bề mặt minh họa theo các vùng địa hình, **không phải DEM hay kết quả đo đạc**. Hai cụm đảo là ký hiệu vị trí tương đối, không thay thế hải đồ hoặc bản đồ hành chính chi tiết.
