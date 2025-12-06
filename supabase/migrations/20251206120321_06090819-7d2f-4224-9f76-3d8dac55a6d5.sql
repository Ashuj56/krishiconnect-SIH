-- Create storage bucket for farmer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('farmer-documents', 'farmer-documents', false);

-- RLS policies for farmer documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'farmer-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'farmer-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'farmer-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create farmer_documents table to track uploads
CREATE TABLE public.farmer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified BOOLEAN DEFAULT false
);

ALTER TABLE public.farmer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
ON public.farmer_documents
FOR ALL
USING (auth.uid() = user_id);