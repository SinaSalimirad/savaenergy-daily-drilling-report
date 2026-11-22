"use client";

import { useState } from "react";
import { SALT_TYPES, type SaltType } from "schema";
import { Button } from "@/components/ui/button";
import { useSaltTable } from "../api";
import { SaltTable } from "./salt-table";

export function SaltTablesView() {
  const [saltType, setSaltType] = useState<SaltType>("NaCl");
  const saltTable = useSaltTable(saltType);

  return (
    <main className="px-16">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Salt tables</h2>
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Salt</legend>
          {SALT_TYPES.map((type) => (
            <Button
              key={type}
              variant={type === saltType ? "default" : "outline"}
              aria-pressed={type === saltType}
              onClick={() => setSaltType(type)}
            >
              {type}
            </Button>
          ))}
        </fieldset>
      </div>

      <div className="mt-6 rounded-xl bg-card px-3 py-5">
        {saltTable.isError ? (
          <div className="flex items-center gap-3 p-4">
            <p className="text-destructive">{saltTable.error.message}</p>
            <Button variant="outline" onClick={() => saltTable.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <SaltTable
            saltType={saltType}
            data={saltTable.data?.data ?? []}
            isLoading={saltTable.isPending}
          />
        )}
      </div>
    </main>
  );
}
