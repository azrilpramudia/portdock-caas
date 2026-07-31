"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Database, HardDrive, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  type: z.enum(["POSTGRESQL", "MYSQL"]),
  version: z.string().min(1),
});

export default function NewDatabasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "POSTGRESQL",
      version: "15-alpine",
    },
  });

  const selectedType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await api.post("/databases", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database provisioned successfully!");
      router.push("/databases");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create database");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createMutation.mutate(values);
  };

  const handleTypeSelect = (type: "POSTGRESQL" | "MYSQL") => {
    form.setValue("type", type);
    if (type === "POSTGRESQL") {
      form.setValue("version", "15-alpine");
    } else {
      form.setValue("version", "8.0");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Provision Database</h1>
          <p className="text-muted-foreground mt-1">
            Deploy a new managed database instantly
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Engine Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Database Engine</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Select the database engine you want to provision
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                  selectedType === "POSTGRESQL" 
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-500/10" 
                    : "border-border hover:border-blue-300 dark:hover:border-blue-700/50"
                }`}
                onClick={() => handleTypeSelect("POSTGRESQL")}
              >
                {selectedType === "POSTGRESQL" && (
                  <div className="absolute top-4 right-4 text-blue-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-none">PostgreSQL</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Powerful, open source object-relational database system.
                </p>
              </div>

              <div 
                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                  selectedType === "MYSQL" 
                    ? "border-amber-600 bg-amber-50/50 dark:bg-amber-500/10" 
                    : "border-border hover:border-amber-300 dark:hover:border-amber-700/50"
                }`}
                onClick={() => handleTypeSelect("MYSQL")}
              >
                {selectedType === "MYSQL" && (
                  <div className="absolute top-4 right-4 text-amber-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-none">MySQL</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The world's most popular open source relational database.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Database Name</Label>
              <Input placeholder="e.g. my-app-db" className="h-11 rounded-xl" {...form.register("name")} />
              <p className="text-[0.8rem] text-muted-foreground">A unique name to identify your database cluster</p>
              {form.formState.errors.name && (
                <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Version Tag (Docker)</Label>
              <Input placeholder="e.g. 15-alpine" className="h-11 rounded-xl" {...form.register("version")} />
              <p className="text-[0.8rem] text-muted-foreground">The specific Docker tag to use (default recommended)</p>
              {form.formState.errors.version && (
                <p className="text-[0.8rem] font-medium text-destructive">{form.formState.errors.version.message}</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Security Notice</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Portdock will automatically generate a highly secure, 16-character random password for this database. 
              The connection string (containing the password) will be available in your database dashboard once provisioning completes.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Provisioning..." : "Provision Database"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
