import { SignInButtons } from "@/components/auth/sign-in-buttons";
import Image from "next/image";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string | string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  const { authError } = await searchParams;
  const initialError = authError
    ? "เข้าสู่ระบบไม่สำเร็จหรือถูกยกเลิก กรุณาลองอีกครั้ง"
    : null;

  return (
    <main className="grid min-h-svh place-items-center app-page-background px-4 py-6 md:p-12">
      <div className="card grid w-full max-w-md overflow-hidden rounded-3xl bg-base-100 shadow-xl md:max-w-5xl md:grid-cols-[44%_56%]">
        <section className="relative aspect-4/3 md:aspect-3/4">
          <Image
            src="/login-hero.png"
            alt="หุ่นยนต์สีม่วงพาสเทลกำลังเล่น OX ใต้ซุ้มวงกลมสีมิ้นต์"
            fill
            preload
            quality={100}
            sizes="(max-width: 767px) min(448px, calc(100vw - 32px)), (max-width: 1120px) calc((100vw - 96px) * 0.44), 451px"
            className="object-cover object-[center_65%] md:object-center"
          />
        </section>

        <section
          className="card-body min-w-0 items-center justify-center px-6 py-10 text-slate-800 lg:px-12"
          aria-labelledby="login-heading"
        >
          <div className="w-full max-w-md">
            <div className="text-center">
              <div
                className="relative mx-auto flex w-fit items-center gap-3"
                role="img"
                aria-label="OX Game"
              >
                <svg
                  className="w-24 shrink-0 lg:w-32"
                  viewBox="0 0 180 90"
                  aria-hidden="true"
                >
                  <circle
                    cx="45"
                    cy="45"
                    r="30"
                    fill="none"
                    stroke="#7bd8b2"
                    strokeWidth="28"
                  />
                  <path
                    d="M109 19 L161 71 M161 19 L109 71"
                    fill="none"
                    stroke="#ff9f89"
                    strokeWidth="29"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-display text-6xl leading-none font-bold tracking-tighter lg:text-7xl">
                  Game
                </span>
                <svg
                  className="absolute -top-4 -right-6 w-8 lg:w-10"
                  viewBox="0 0 68 72"
                  aria-hidden="true"
                >
                  <path
                    d="M12 29 L18 8 M34 40 L53 21 M45 60 L63 56"
                    fill="none"
                    stroke="#d2c2fa"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1
                id="login-heading"
                className="mt-8 text-3xl font-bold tracking-tight lg:text-4xl"
              >
                พร้อมเล่นหรือยัง?
              </h1>
              <p className="mt-4 text-base text-base-content/60 lg:text-lg">
                เข้าสู่ระบบเพื่อเล่น OX กับบอท
              </p>
            </div>

            <SignInButtons initialError={initialError} />
          </div>
          <p className="mt-8 max-w-md grow-0 text-center text-xs leading-relaxed text-base-content/50">
            การเข้าสู่ระบบถือว่าคุณยอมรับการจัดเก็บชื่อ อีเมล
            และรูปโปรไฟล์จากผู้ให้บริการที่เลือก
          </p>
        </section>
      </div>
    </main>
  );
}
