import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile.data) setFullName(profile.data.full_name ?? "");
  }, [profile.data]);

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.data!.id);
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Profile" description="Your account settings." />
      <PageBody>
        <section className="max-w-xl rounded-lg border border-border p-4 sm:p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input className="min-h-11" value={profile.data?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                className="min-h-11"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <Button onClick={save} disabled={saving} className="w-full sm:w-auto min-h-11">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </section>
      </PageBody>
    </>
  );
}
