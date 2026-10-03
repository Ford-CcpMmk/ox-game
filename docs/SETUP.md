# ติดตั้งและรัน OX Game

คู่มือนี้สำหรับนำ repository ปัจจุบันไปรัน ไม่ต้องสร้างโปรเจกต์หรือสร้าง auth schema ใหม่
Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, daisyUI 5,
Font Awesome 7, Better Auth, Prisma 7 และ PostgreSQL 17
เวอร์ชันที่ติดตั้งจริงอ้างอิง `package-lock.json`

## 1. เตรียมเครื่อง

- Node.js 22.14 ขึ้นไป แนะนำ Node 22 LTS และ npm
- Docker Desktop หรือ Docker runtime ที่รองรับ Docker Compose
- Git สำหรับ clone repository และบัญชี Google/Meta เพื่อสร้าง OAuth credentials
- เชื่อมต่ออินเทอร์เน็ตเมื่อติดตั้ง npm packages, โหลด Google Fonts ตอน build และใช้ OAuth

```bash
node --version
npm --version
docker compose version
```

Clone repository หรือแตกไฟล์ source แล้วเปิด terminal ในโฟลเดอร์ที่มี `package.json`

## 2. สร้าง environment

```bash
cp .env.example .env
openssl rand -base64 32
```

แก้ `.env` โดยใช้ secret ที่สร้างแทน placeholder:

```dotenv
DATABASE_URL="postgresql://ox_user:ox_password@localhost:5433/ox_game"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="ใส่ค่าแบบสุ่มอย่างน้อย 32 ตัวอักษร"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

`.env.example` อยู่ใน repository แต่ `.env` ถูก ignore ห้ามใส่ credentials จริงใน source
ค่าฐานข้อมูลด้านบนใช้สำหรับ Docker ในเครื่องเท่านั้น ถ้าใช้ PostgreSQL ของตัวเองให้แก้ URL
ต้องมี credentials อย่างน้อยหนึ่ง provider เพื่อเข้าสู่ระบบได้จริง
ปุ่มของ provider ที่ยังไม่ตั้งค่าจะยังแสดงอยู่ แต่ใช้ login ไม่ได้

<a id="oauth"></a>
## 3. OAuth

### Google

1. เปิด [Google Cloud Console](https://console.cloud.google.com/) เลือกหรือสร้าง project
2. ตั้งค่า Google Auth Platform / OAuth consent screen ระบุชื่อแอปและอีเมล
3. หากแอปอยู่สถานะ Testing ให้เพิ่มบัญชีที่ใช้ทดสอบเป็น test user
4. สร้าง OAuth client ชนิด Web application
5. ตั้ง JavaScript origin เป็น `http://localhost:3000`
6. ตั้ง Authorized redirect URI เป็น `http://localhost:3000/api/auth/callback/google`
7. คัดลอก client ID/secret ใส่ `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET`

### Facebook

1. เปิด [Meta for Developers](https://developers.facebook.com/) สร้างแอปที่รองรับ Facebook Login
2. เพิ่มและตั้งค่า Facebook Login สำหรับเว็บไซต์
3. ใส่ Valid OAuth Redirect URI เป็น `http://localhost:3000/api/auth/callback/facebook`
4. ใส่ App ID/secret ลงใน `FACEBOOK_CLIENT_ID` และ `FACEBOOK_CLIENT_SECRET`
5. ใน development mode ใช้บัญชีที่ได้รับ role ของแอปหรือบัญชีทดสอบที่ Meta อนุญาต
6. ตั้งค่าเว็บไซต์/app domains และข้อมูลที่ dashboard ของแอปกำหนด

หาก Meta ไม่ยอมรับ callback แบบ HTTP localhost ให้ใช้ HTTPS development URL
แล้วเปลี่ยน `BETTER_AUTH_URL`, site URL และ callback ให้ตรงกัน ก่อนเปิดสู่สาธารณะ
ต้องทำตามข้อกำหนดของผู้ให้บริการ เช่น privacy policy และ app review ตาม permissions ที่ใช้
ชื่อเมนูของ provider อาจเปลี่ยนได้ ให้ดู [Better Auth social providers](https://www.better-auth.com/docs/authentication/google)
และ [Facebook provider](https://www.better-auth.com/docs/authentication/facebook) ประกอบ

## 4. ติดตั้ง packages และฐานข้อมูล

ตั้ง `.env` ก่อน `npm ci` เพราะ postinstall เรียก Prisma generate และ config อ่าน environment

```bash
npm ci
docker compose up -d --wait
docker compose ps
npm run db:deploy
npm run db:generate
```

- `npm ci` ใช้เวอร์ชันตาม lockfile และติดตั้ง Font Awesome, Tailwind และ daisyUI ด้วย
- PostgreSQL ใน container ใช้ port 5432 แต่เครื่อง host เข้าผ่าน 5433
- `db:deploy` ใช้ migrations ที่มากับ repository ไม่สร้าง migration ใหม่
- `db:generate` สร้าง `src/generated/prisma` ซึ่งไม่เก็บใน Git
- Prisma CLI อ่าน `prisma.config.ts` และ `prisma/schema.prisma`

## 5. เปิดแอป

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) หากยังไม่ login จะไป `/login`
เข้าสู่ระบบ เลือกระดับบอท แล้วเล่น คะแนนและรอบล่าสุดเก็บในฐานข้อมูล
หลังแก้ `.env` ให้หยุดและเปิด dev server ใหม่

## 6. Tailwind, daisyUI และ Font Awesome

ใน repository นี้ติดตั้งและตั้งค่าแล้ว คำสั่งด้านล่างเป็นข้อมูลสำหรับบำรุงรักษา
ไม่ต้องรันซ้ำหลัง `npm ci` และไม่ควรอัปเกรดเป็น latest ระหว่างติดตั้งโปรเจกต์

```bash
npm install daisyui@5 @fortawesome/free-solid-svg-icons@7 @fortawesome/free-brands-svg-icons@7
npm install -D tailwindcss@4 @tailwindcss/postcss@4
```

`postcss.config.mjs` ใช้ `@tailwindcss/postcss` และ `src/app/globals.css` มี:

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: pastel --default;
}
```

`layout.tsx` กำหนด `data-theme="pastel"` Tailwind ใช้จัด layout ส่วน daisyUI
เป็นฐานของปุ่ม การ์ด และ loading; สไตล์ clay/animation อยู่ใน `src/styles/game`
Font Awesome import เฉพาะ icons ที่ใช้ แล้ว render SVG ผ่าน `UiIcon`
ไม่ต้องใช้ CDN, Kit key หรือแพ็กเกจ React wrapper เพิ่ม
เอกสารอ้างอิง: [daisyUI install](https://daisyui.com/docs/install/),
[Font Awesome SVG packages](https://docs.fontawesome.com/web/use-with/react/add-icons)

## 7. daisyUI MCP สำหรับ coding agent (ไม่บังคับ)

MCP ช่วย agent อ่านเอกสาร/component ไม่มีผลต่อ runtime ของเว็บ
การรันโปรเจกต์ไม่ต้องติดตั้ง Codex หรือ MCP และคู่มือนี้ไม่ได้ตั้งค่า MCP ให้อัตโนมัติ

ถ้ามี Codex CLI อยู่แล้ว สามารถเลือก GitMCP ฟรีของบุคคลที่สามตาม
[คู่มือ daisyUI สำหรับ Codex](https://daisyui.com/docs/mcp/codex/):

```bash
codex mcp add daisyui-gitmcp -- npx -y mcp-remote https://gitmcp.io/saadeghi/daisyui
codex mcp list
```

Blueprint เป็น MCP ทางการของ daisyUI และต้องมี license; Context7 เป็นอีกทางเลือก
ดูเงื่อนไขและวิธีติดตั้งปัจจุบันในคู่มือของ daisyUI ก่อนเลือก ไม่ต้องใส่ MCP ลง dependencies ของเว็บ

## 8. ตรวจคะแนนและข้อมูล

```bash
npm run db:studio
```

เปิด URL ที่ Prisma แสดง เลือกตาราง `user` ดู `score` และ `winStreak`
ตาราง `game` เก็บกระดาน ระดับบอท version และผลคะแนนของรอบล่าสุด
เครื่องมือนี้เชื่อมฐานข้อมูลโดยตรง จึงใช้เฉพาะผู้ที่มีสิทธิ์ดูฐานข้อมูล
แอปปัจจุบันไม่มี `/admin/scores` หรือคอลัมน์ role

## 9. ตรวจโค้ดและ production build

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm test` ไม่ต้องเปิด PostgreSQL เพราะใช้ฐานข้อมูลจำลอง
ตรวจ transaction กับ PostgreSQL จริงเพิ่มเติมได้เมื่อเปิด database และ deploy migrations แล้ว:

```bash
npm run test:db
```

ใช้กับฐานข้อมูลพัฒนาเท่านั้น ชุดทดสอบสร้างผู้ใช้ชั่วคราวและลบผู้ใช้นั้นใน finally
ตรวจการบันทึกระดับและคำขอชนะพร้อมกันที่ต้องคิดคะแนนครั้งเดียว

ถ้า build ด้วย Turbopack มีปัญหา สามารถทดสอบ webpack ด้วย `npm run build -- --webpack`
production ต้องมี `.env`/environment และ migrations ครบก่อนเปิดแอป
ต้องตั้ง `BETTER_AUTH_URL` และ callbacks เป็น URL จริงที่ตรงกัน
ภาพหุ่นยนต์และเสียงอยู่ใน `public/game-assets` พร้อมใช้งาน ไม่ต้องสร้างใหม่

## 10. เปลี่ยน schema และแก้ปัญหา

เมื่อผู้พัฒนาแก้ `prisma/schema.prisma`:

```bash
npm run db:migrate -- --name describe_change
npm run db:generate
```

Commit migration ใหม่พร้อม schema; ผู้รับโค้ดรัน `db:deploy` และ `db:generate`
ถ้า dev server ยังเก็บ Prisma client เก่า ให้ restart dev server
อย่ารัน `auth:schema` หรือสร้าง init migration ใหม่เพียงเพื่อรับโค้ดมารัน

- **database connection error:** ตรวจ `docker compose ps`, port 5433 และ `DATABASE_URL`
- **port 5433 ถูกใช้:** เปลี่ยน host port ใน compose และ URL ให้ตรงกัน
- **OAuth redirect mismatch:** ตรวจ origin/callback รวม protocol, host, port และ provider ID
- **Google access blocked:** ตรวจ test users และ consent screen
- **Facebook login ไม่สำเร็จ:** ตรวจ App ID/secret, roles, redirect และข้อกำหนด HTTPS
- **Cannot read properties of undefined / missing field:** generate client, deploy migrations และ restart dev server
- **build โหลด font ไม่ได้:** อนุญาต network ไป Google Fonts แล้วลองใหม่
- **เสียงไม่ดัง:** เปิดเสียงด้วยปุ่มข้าง logout และตรวจเสียงของ browser/เครื่อง เสียงเริ่มจากการกดของผู้เล่น

หยุด database โดยเก็บข้อมูลไว้:

```bash
docker compose stop
```

การลบ Docker volume จะลบคะแนนและบัญชีในฐานข้อมูลด้วย อย่าลบหากต้องการเก็บข้อมูลเดิม
