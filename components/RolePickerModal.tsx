"use client";
import { useState } from "react";
import { chooseRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { Users, Store } from "lucide-react";

export default function RolePickerModal({
  onClose
}: { onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<false | "general" | "provider">(false);

  const handlePick = async (role: "general" | "provider") => {
    try {
      setSubmitting(role);
      await chooseRole(role);
      onClose();                        // close modal on success
      router.replace(role === "general" ? "/dashboard" : "/provider"); // goto dash
    } catch (err) {
      alert("Failed to save role, please retry");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="p-8 w-[95%] max-w-md text-center">
        <h3 className="font-bold text-xl mb-2">Pick your account type</h3>
        <p className="text-gray-600 mb-8">You only need to do this once.</p>

        <div className="flex flex-col gap-4">
          <Button
            disabled={!!submitting}
            onClick={() => handlePick("general")}
            className="w-full flex items-center justify-center gap-2"
          >
            {submitting === "general" ? "Saving…" : <>
              <Users className="h-5 w-5" /> I’m a Traveller
            </>}
          </Button>

          <Button
            disabled={!!submitting}
            variant="outline"
            onClick={() => handlePick("provider")}
            className="w-full flex items-center justify-center gap-2"
          >
            {submitting === "provider" ? "Saving…" : <>
              <Store className="h-5 w-5" /> I provide travel services
            </>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
