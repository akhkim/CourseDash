'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  id: string;
}

interface TabContainerProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  activeTab: externalActiveTab,
  onTabChange,
  children
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  
  const activeTab = externalActiveTab || internalActiveTab;
  
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  // Find the currently active child
  const activeChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.props.id === activeTab
  );

  return (
    <div>
      <div className="border-b">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                "px-4 rounded-none border-b-2 border-transparent",
                activeTab === tab.id && "border-primary text-primary font-medium"
              )}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="py-4">
        {activeChild}
      </div>
    </div>
  );
};

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
  return <div className="animate-fade-in">{children}</div>;
};

export default TabContainer;
