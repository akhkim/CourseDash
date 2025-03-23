'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp, Check, X } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File | null) => void;
  acceptedFileTypes?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Immediately notify parent component
      onFileUpload(file);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Notify parent that file was removed
    onFileUpload(null);
  };

  return (
    <div className="animate-fade-in">
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-all ${selectedFile ? 'bg-primary/5' : ''}`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept={acceptedFileTypes}
          multiple={false}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!selectedFile ? (
          <>
            <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">Upload file</p>
            <p className="text-xs text-muted-foreground">
              Click to browse or drag and drop
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
