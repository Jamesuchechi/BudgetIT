import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useIdleLogout(timeoutMs = DEFAULT_TIMEOUT_MS, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        toast.info("Session expired due to inactivity. Logging out...");
        await supabase.auth.signOut();
        window.location.assign("/auth?reason=idle");
      }, timeoutMs);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [timeoutMs, enabled]);
}
