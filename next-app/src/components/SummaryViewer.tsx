'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Clock } from 'lucide-react';

interface SummaryViewerProps {
  title: string;
  summary: string;
  fileName: string;
  date: string;
  fileType: string;
}

const SummaryViewer: React.FC<SummaryViewerProps> = ({
  title,
  summary,
  fileName,
  date,
  fileType
}) => {
  return (
    <Card className="shadow-soft overflow-hidden animate-fade-in animate-delay-100 mt-4">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{title}</span>
          </div>
          <div className="text-sm font-normal text-muted-foreground flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-muted/20 rounded-md p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{fileName}</span>
          </div>
          <span className="text-xs text-muted-foreground uppercase">{fileType}</span>
        </div>
        
        <h3 className="font-medium text-lg mb-3">Summary</h3>
        <div className="text-muted-foreground space-y-2">
          <p>{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryViewer;
