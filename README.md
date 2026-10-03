# OX Game

เกม OX ผู้เล่นแข่งกับบอท 3 ระดับ เข้าสู่ระบบด้วย Google/Facebook
เก็บกระดาน คะแนน และจำนวนชนะติดต่อกันบน PostgreSQL โดย server ตรวจทุกตา
UI แบบ pastel มีเสียงเกมและปุ่มเปิด–ปิดเสียง

## เริ่มรันในเครื่อง

ต้องมี Node.js **22.14 ขึ้นไป** (แนะนำ Node 22 LTS), npm, Docker และ Docker Compose
พร้อม OAuth credentials อย่างน้อยหนึ่ง provider สำหรับเข้าสู่ระบบจริง

เปิด terminal ในโฟลเดอร์โปรเจกต์:

```bash
cp .env.example .env
openssl rand -base64 32
```

นำ secret ที่สร้างไปใส่ `BETTER_AUTH_SECRET` ใน `.env` แล้วเติม Google/Facebook credentials
ค่า database เริ่มต้นใน `.env.example` ตรงกับ `compose.yaml`

```bash
npm ci
docker compose up -d --wait
npm run db:deploy
npm run db:generate
npm run dev
```

เปิด [localhost:3000](http://localhost:3000) แล้วเข้าสู่ระบบ
Font Awesome, Tailwind และ daisyUI ติดตั้งพร้อม `npm ci` แล้ว ไม่ต้องลงแยก
MCP เป็นเครื่องมือเสริมสำหรับ coding agent ไม่จำเป็นต่อการรันเกม

| Provider | Callback URL ในเครื่อง |
| --- | --- |
| Google | `http://localhost:3000/api/auth/callback/google` |
| Facebook | `http://localhost:3000/api/auth/callback/facebook` |

### ตั้งค่าการเข้าสู่ระบบ

ใช้ credentials ของ OAuth application ที่คุณสร้างเอง แล้วใส่ลงใน `.env`:

| ตัวแปร | ค่า |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Client ID และ secret ของ Google OAuth client ชนิด Web application |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | App ID และ secret ของแอป Facebook Login |
| `BETTER_AUTH_URL` | URL ของแอป เริ่มต้น `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | ค่าสุ่มที่สร้างจากคำสั่งด้านบน |

สร้าง credentials ผ่าน [Google Cloud Console](https://console.cloud.google.com/)
หรือ [Meta for Developers](https://developers.facebook.com/) และตั้ง callback ตามตารางด้านบน
สำหรับ Google ให้ตั้ง origin เป็น `http://localhost:3000` ด้วย
ถ้า provider อยู่ในโหมดทดสอบ ให้บัญชีที่จะตรวจงานมีสิทธิ์ทดสอบแอปนั้น
ตั้งค่าอย่างน้อยหนึ่ง provider แล้วเลือกปุ่มเข้าสู่ระบบของ provider นั้น
ปุ่มของ provider ที่ไม่ได้ตั้งค่าจะยังแสดง แต่ไม่สามารถเข้าสู่ระบบได้
หลังแก้ `.env` ให้หยุดและเปิด server ใหม่ และไม่ควรส่ง credentials จริงเข้า Git

## วิธีใช้งานและกติกา

- คุณเป็น X และเริ่มก่อน บอทเป็น O
- ค่าเริ่มต้นคือเลเวล 1 (ง่าย)
- ง่าย: สุ่มช่อง; ปานกลาง: กันคุณชนะแล้วสุ่ม; ยาก: ชนะทันทีถ้าทำได้ จากนั้นกันแพ้แล้วสุ่ม
- เลือกระดับก่อนลงช่องแรกหรือหลังจบรอบ คะแนนใช้กติกาเดียวกันทุกระดับ
- ชนะ +1; แพ้ −1 แต่ต่ำสุด 0; เสมอคะแนนไม่เปลี่ยน
- ชนะติดกัน 3 ครั้งได้โบนัส +1 แล้วเริ่มนับใหม่ แพ้หรือเสมอรีเซ็ต streak
- กระดานว่างจะเริ่มเกมใหม่ซ้ำไม่ได้; รีเฟรชหน้าแล้วเล่นรอบเดิมต่อได้

เข้าสู่ระบบที่หน้า `/login` แล้วเลือกระดับบอทใน sidebar กดช่องว่างบนกระดานเพื่อลง X
เมื่อจบรอบ คะแนนและจำนวนชนะติดกันจะอัปเดต กด **เริ่มเกมใหม่** เพื่อเล่นรอบถัดไป
เปิด–ปิดเสียงได้จากปุ่มข้าง **ออกจากระบบ** และการออกจากระบบมีหน้าต่างยืนยัน

## ตรวจคะแนนผู้เล่นทั้งหมด

เครื่องมือที่ใช้ตอบข้อกำหนดนี้คือ **Prisma Studio** เปิด terminal อีกหน้าต่างในโฟลเดอร์โปรเจกต์
โดยใช้ `.env` เดียวกับแอป และเปิดฐานข้อมูลไว้ แล้วรัน:

```bash
npm run db:studio
```

เปิด URL ที่คำสั่งแสดงใน terminal แล้วเลือกตาราง **`user`**
แต่ละแถวคือผู้เล่นหนึ่งคน ดูข้อมูลได้จากคอลัมน์ต่อไปนี้:

| คอลัมน์ | ความหมาย |
| --- | --- |
| `name` | ชื่อผู้เล่น |
| `email` | อีเมลที่ใช้เข้าสู่ระบบ |
| `score` | คะแนนรวมปัจจุบัน |
| `winStreak` | จำนวนชนะติดต่อกันที่กำลังนับเพื่อรับโบนัส |

สามารถเรียงตาม `score` เพื่อเปรียบเทียบคะแนน และค้นหา/กรองผู้เล่นได้ใน Studio
ผู้เล่นจะปรากฏหลังเข้าสู่ระบบครั้งแรก ส่วนตาราง **`game`** ใช้ตรวจกระดานและระดับบอทของรอบล่าสุด
Prisma Studio เป็นเครื่องมือที่เข้าถึงฐานข้อมูลโดยตรง ผู้ตรวจงานต้องมี environment สำหรับเชื่อมฐานข้อมูล
แอปไม่มีหน้าแอดมินหรือระบบ role แยกต่างหาก

## การทำงานตามโจทย์

| ข้อกำหนด | สิ่งที่มีในโปรเจกต์ |
| --- | --- |
| เกม OX แบบ Web Application | หน้าเกมบน Next.js ผู้เล่น X แข่งกับบอท O |
| ต้องเข้าสู่ระบบก่อนเล่นและใช้ OAuth 2.0 | Google/Facebook ผ่าน Better Auth; ผู้ที่ยังไม่เข้าสู่ระบบจะไปหน้า login |
| กติกา OX ทั่วไป | ตรวจชนะ เสมอ และช่องที่เล่นได้บน server |
| เก็บคะแนนผู้เล่น | PostgreSQL เก็บคะแนนแยกตามบัญชี |
| ชนะ +1 และแพ้ −1 | คิดคะแนนเมื่อจบรอบ โดยคะแนนต่ำสุดเป็น 0 |
| ชนะติดกัน 3 ครั้งได้โบนัส +1 | ชนะสามรอบติดได้รวม 4 คะแนน แล้วเริ่มนับใหม่ |
| เครื่องมือตรวจคะแนนทุกคน | Prisma Studio ตาราง `user` ตามวิธีด้านบน |

กรณีเสมอคะแนนไม่เปลี่ยน และเมื่อแพ้หรือเสมอจะรีเซ็ตจำนวนชนะติดต่อกัน
server ตรวจเจ้าของเกมและ version ของกระดาน เพื่อป้องกันคำขอซ้ำคิดคะแนนมากกว่าหนึ่งครั้ง

## ทดสอบโปรเจกต์

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` ตรวจชุดทดสอบกติกา คะแนน และ server โดยใช้ฐานข้อมูลจำลอง
จึงรันได้โดยไม่ต้องเปิด PostgreSQL ชุดทดสอบฐานข้อมูลจริงหนึ่งรายการจะขึ้น **skip** โดยตั้งใจ
เพราะต้องเปิดฐานข้อมูลและใช้ migrations ก่อน ไม่ได้หมายความว่าเทสต์ล้มเหลว

เมื่อเตรียมฐานข้อมูลตามขั้นตอนติดตั้งแล้ว ให้รันทดสอบเพิ่มเติม:

```bash
npm run test:db
```

เทสต์นี้ตรวจว่าระดับบอทถูกบันทึกจริง และคำขอชนะที่ส่งพร้อมกันคิดคะแนนเพียงครั้งเดียว
ใช้ฐานข้อมูลสำหรับพัฒนา/ทดสอบ เพราะจะสร้างผู้ใช้ชั่วคราวและลบข้อมูลของผู้ใช้นั้นหลังทดสอบ

## Production build

```bash
npm run build
npm start
```

หยุด dev server ก่อนใช้ port เดียวกัน และตั้ง environment ให้ครบ
หากใช้ URL อื่น ให้แก้ `BETTER_AUTH_URL` และ callback ของ provider ให้ตรงกัน
การ build ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด Google Fonts

## เทคโนโลยี

Next.js 16, React 19, TypeScript, Tailwind CSS 4, daisyUI 5, Font Awesome 7,
Better Auth, Prisma 7 และ PostgreSQL 17 โดยใช้เวอร์ชันจาก `package-lock.json`

## คำสั่ง

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm run dev` | เปิด dev server |
| `npm run build` / `npm start` | สร้างและเปิด production build |
| `npm run lint` / `npm run typecheck` | ตรวจโค้ด |
| `npm test` | ทดสอบกติกาและ server ด้วยฐานข้อมูลจำลอง |
| `npm run test:db` | ทดสอบ transaction บนฐานข้อมูลพัฒนาจริง |
| `npm run db:deploy` | ใช้ migrations ที่มีอยู่ |
| `npm run db:migrate -- --name ชื่อการเปลี่ยนแปลง` | สร้าง migration เมื่อแก้ schema ในการพัฒนา |
| `npm run db:generate` | สร้าง Prisma client |
| `npm run db:studio` | ดูข้อมูลในฐานข้อมูล |

## โครงสร้าง

- `src/app`: routes, layout และ global theme
- `src/actions`: Server Actions รับคำสั่งเกมจาก client
- `src/components/game`: header, board, sidebar, difficulty picker และสัญลักษณ์ X/O
- `src/components/auth`: ปุ่มเข้าสู่ระบบและออกจากระบบ
- `src/components/game/ox-game.tsx`: ประกอบหน้าเกม
- `src/hooks`: สถานะเกมและเสียง
- `src/lib`: กติกา คะแนน config ระดับบอท authentication และฐานข้อมูล
- `src/styles/game`: สไตล์แยกตามหน้าที่; `ox-game.css` กำหนดลำดับ import
- `public/game-assets`: ภาพและเสียงที่ใช้จริง ชื่อไฟล์ตามหน้าที่
- `prisma`: schema และ migrations; `prisma.config.ts`: config ของ CLI
- `tests`: automated tests

ข้อกำหนด: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)

## แก้ปัญหาเบื้องต้น

- เชื่อมฐานข้อมูลไม่ได้: ตรวจ `docker compose ps` และ `DATABASE_URL` โดย Docker ในเครื่องใช้ port **5433**
- OAuth เข้าสู่ระบบไม่ได้: ตรวจ credentials, callback URL และสิทธิ์ของบัญชีทดสอบ
- Prisma client ไม่ตรงกับ schema: รัน `npm run db:deploy` และ `npm run db:generate` แล้วเปิด server ใหม่
- Port 3000 ถูกใช้: หยุดโปรแกรมที่ใช้ port นั้น หรือเปลี่ยน port พร้อม URL และ OAuth callback ให้ตรงกัน

หยุดฐานข้อมูลโดยเก็บคะแนนไว้ด้วย `docker compose stop` และเปิดใหม่ด้วย `docker compose up -d --wait`
