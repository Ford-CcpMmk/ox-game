"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { authClient } from "@/lib/auth-client";

type Provider = "google" | "facebook";

const providers: Array<{ id: Provider; label: string }> = [
  { id: "google", label: "เข้าสู่ระบบด้วย Google" },
  { id: "facebook", label: "เข้าสู่ระบบด้วย Facebook" },
];

const providerIconClassName = "size-8 shrink-0 lg:size-10";

function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <Image
        src="/icons/google.svg"
        alt=""
        width={40}
        height={40}
        className={providerIconClassName}
        unoptimized
      />
    );
  }

  const [width, height, , , data] = faFacebook.icon;
  const paths = Array.isArray(data) ? data : [data];

  return (
    <svg className={providerIconClassName} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      {paths.map((path, index) => <path key={index} d={path} fill="currentColor" />)}
    </svg>
  );
}

export function SignInButtons({ initialError = null }: { initialError?: string | null }) {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  useEffect(() => {
    function restoreLogin(event: PageTransitionEvent) {
      if (!event.persisted) return;
      // Back from an OAuth provider can restore the entire React state from bfcache.
      setPendingProvider(null);
      setError(null);
      void refetch();
    }

    window.addEventListener("pageshow", restoreLogin);
    return () => window.removeEventListener("pageshow", restoreLogin);
  }, [refetch]);

  async function signIn(provider: Provider) {
    setPendingProvider(provider);
    setError(null);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/login?authError=oauth",
      });
      if (result.error) {
        setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
        setPendingProvider(null);
      }
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
      setPendingProvider(null);
    }
  }

  return (
    <div className="mt-8 grid gap-4">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={pendingProvider !== null}
          onClick={() => signIn(provider.id)}
          aria-busy={pendingProvider === provider.id}
          className={`btn h-16 w-full gap-4 rounded-2xl text-base shadow-sm hover:enabled:-translate-y-0.5 hover:enabled:shadow-md motion-reduce:transform-none motion-reduce:transition-none lg:text-lg ${
            provider.id === "google"
              ? "bg-white border-base-300"
              : "btn-primary [--btn-color:#2f75f8] [--btn-fg:white]"
          }`}
        >
          <ProviderIcon provider={provider.id} />
          {pendingProvider === provider.id ? "กำลังเชื่อมต่อ..." : provider.label}
        </button>
      ))}

      {error ? (
        <p role="alert" className="text-error text-center text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
