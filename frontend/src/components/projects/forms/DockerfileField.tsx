import { useRef } from "react";
import { CheckCircle2, FileCode } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DockerfileFieldProps {
  file: File | null;
  setFile: (file: File | null) => void;
  dragOver: boolean;
  setDragOver: (state: boolean) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  uploadProgress: number;
  isPending: boolean;
}

export function DockerfileField({
  file,
  setFile,
  dragOver,
  setDragOver,
  handleFileDrop,
  uploadProgress,
  isPending,
}: DockerfileFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3 pt-2 border-t border-border mt-4">
      <div>
        <Label>Upload Dockerfile</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Upload file konfigurasi Dockerfile Anda. Max 5MB.
        </p>
      </div>
      
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150",
          dragOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" :
          file ? "border-green-400 bg-green-50 dark:bg-green-900/20" :
          "border-border hover:border-blue-400 hover:bg-muted dark:hover:bg-muted/50"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-green-700 dark:text-green-400">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">Klik untuk mengubah file</p>
          </>
        ) : (
          <>
            <FileCode className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">
              Drag & drop file Dockerfile di sini
            </p>
            <p className="text-xs text-muted-foreground">
              atau klik untuk memilih file
            </p>
          </>
        )}
      </div>
      
      {isPending && uploadProgress > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mengunggah Dockerfile...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {uploadProgress === 100 && (
            <p className="text-xs text-center text-blue-500 animate-pulse mt-2">
              Mem-build Docker Image (ini mungkin memakan waktu beberapa menit)...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
