"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { UiIcon } from "@/components/ui-icon";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ onClickSound }: { onClickSound?: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (pending) return;
    onClickSound?.();
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("sign-out failed");
      dialog.current?.close();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setPending(false);
    }
  }

  return <>
    <button type="button" className="btn btn-outline btn-sm" onClick={() => { onClickSound?.(); setError(null); dialog.current?.showModal(); }}>
      <UiIcon icon={faRightFromBracket} />ออกจากระบบ
    </button>
    <dialog ref={dialog} className="ox-signout-dialog" aria-labelledby="signout-title" aria-describedby="signout-description"
      onCancel={event => { if (pending) event.preventDefault(); }}
      onClick={event => { if (event.target === event.currentTarget && !pending) dialog.current?.close(); }}>
      <div className="ox-signout-content">
        <span className="ox-signout-symbol"><UiIcon icon={faRightFromBracket} /></span>
        <h2 id="signout-title">ออกจากระบบใช่ไหม?</h2>
        <p id="signout-description">คะแนนของคุณจะยังอยู่<br />กลับมาเข้าสู่ระบบเพื่อเล่นต่อได้เสมอ</p>
        {error && <p role="alert" className="text-error">{error}</p>}
        <div className="ox-signout-actions">
          <button type="button" className="btn ox-signout-cancel" autoFocus disabled={pending} onClick={() => { onClickSound?.(); dialog.current?.close(); }}>เล่นต่อ</button>
          <button type="button" className="btn ox-new-game" disabled={pending} onClick={signOut}>
            {pending ? <span className="loading loading-spinner loading-xs" aria-hidden="true" /> : <UiIcon icon={faRightFromBracket} />}
            {pending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
          </button>
        </div>
      </div>
    </dialog>
  </>;
}
