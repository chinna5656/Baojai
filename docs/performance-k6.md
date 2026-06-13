# Performance Testing With k6

ใช้ Grafana k6 สำหรับทดสอบประสิทธิภาพเว็บ Baojai บนเครื่อง local หรือ server ทดสอบ

## ติดตั้ง k6

Windows:

```powershell
winget install k6
```

ตรวจสอบ:

```powershell
k6 version
```

## รันแอปก่อน

```powershell
npm run dev
```

หรือทดสอบ production build:

```powershell
npm run build
npm run start
```

## Smoke Performance Test

```powershell
npm run perf:k6
```

ค่าเริ่มต้นจะยิงไปที่:

```txt
http://localhost:3000
```

เปลี่ยน URL ได้ด้วย `BASE_URL`:

```powershell
$env:BASE_URL="http://localhost:3000"; npm run perf:k6
```

## Export Summary

```powershell
npm run perf:k6:summary
```

ไฟล์ผลลัพธ์จะอยู่ที่:

```txt
perf-results/k6-summary.json
```

## ทดสอบ Chat กับ Ollama

ค่าเริ่มต้นจะทดสอบเฉพาะ `GET /api/chat` เพื่อเช็กสถานะ เพราะ `POST /api/chat` อาจช้าเมื่อ Ollama รันผ่าน Docker

ถ้าต้องการทดสอบการตอบของ AI ด้วย:

```powershell
$env:INCLUDE_CHAT="1"; npm run perf:k6
```

## Thresholds

ไฟล์ [k6/baojai-smoke.js](../k6/baojai-smoke.js) ตั้ง threshold ไว้:

```txt
http_req_failed < 2%
http_req_duration p95 < 1500ms
page duration p95 < 1500ms
api duration p95 < 2500ms
```

ถ้า chat ผ่าน Ollama ช้า ให้รันแยกด้วย `INCLUDE_CHAT=1` และดู metric `chat-post`
