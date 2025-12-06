import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Check, Loader2, Image, File, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_at: string;
  verified: boolean;
}

const documentTypes = [
  { id: "aadhaar", label: "Aadhaar Card", required: true },
  { id: "land_records", label: "Land Records (7/12 or equivalent)", required: true },
  { id: "bank_passbook", label: "Bank Passbook", required: true },
  { id: "caste_certificate", label: "Caste Certificate", required: false },
  { id: "passport_photo", label: "Passport Photo", required: false },
  { id: "pan_card", label: "PAN Card", required: false },
  { id: "income_certificate", label: "Income Certificate", required: false },
  { id: "other", label: "Other Document", required: false },
];

export default function DocumentManager() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("farmer_documents")
        .select("*")
        .eq("user_id", user?.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (docType: string, file: File) => {
    if (!user) return;

    try {
      setUploading(docType);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${docType}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("farmer-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from("farmer_documents")
        .insert({
          user_id: user.id,
          document_type: docType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      fetchDocuments();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      console.error("Upload error:", error);
      toast.error(message);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (doc: Document) => {
    try {
      // Delete from storage
      await supabase.storage
        .from("farmer-documents")
        .remove([doc.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("farmer_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const getDocumentForType = (docType: string) => {
    return documents.find(d => d.document_type === docType);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadedCount = documentTypes.filter(dt => getDocumentForType(dt.id)).length;
  const requiredCount = documentTypes.filter(dt => dt.required).length;
  const requiredUploaded = documentTypes.filter(dt => dt.required && getDocumentForType(dt.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            My Documents
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {uploadedCount}/{documentTypes.length} uploaded
          </span>
        </CardTitle>
        {requiredUploaded < requiredCount && (
          <div className="flex items-center gap-2 text-xs text-warning mt-2">
            <AlertCircle className="w-4 h-4" />
            {requiredCount - requiredUploaded} required document(s) missing
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {documentTypes.map((docType) => {
          const uploadedDoc = getDocumentForType(docType.id);
          const isUploading = uploading === docType.id;

          return (
            <div
              key={docType.id}
              className={cn(
                "p-3 rounded-xl border transition-all",
                uploadedDoc ? "bg-success/5 border-success/20" : "bg-muted/50 border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    uploadedDoc ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {uploadedDoc ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <File className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{docType.label}</span>
                      {docType.required && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                    </div>
                    {uploadedDoc && (
                      <p className="text-xs text-muted-foreground">
                        {uploadedDoc.file_name} • {formatFileSize(uploadedDoc.file_size)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadedDoc ? (
                    <>
                      {uploadedDoc.verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                          Verified
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(uploadedDoc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(docType.id, file);
                        }}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
