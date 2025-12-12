import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Car, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
}

export function VehicleImageUpload({ value, onChange, required = false }: VehicleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(filePath);

      onChange(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>
        Foto do Veículo {required && <span className="text-destructive">*</span>}
      </Label>
      
      {value ? (
        <div className="relative group">
          <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted">
            <img
              src={value}
              alt="Veículo"
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-10 w-10 mb-2 animate-spin" />
              <span className="text-sm">Enviando...</span>
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">Clique para enviar</span>
              <span className="text-xs text-muted-foreground mt-1">
                ou arraste e solte uma imagem
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
