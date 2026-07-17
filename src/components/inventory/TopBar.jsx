import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopBar({ title, onSortClick, onMenuClick }) {
    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
                <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                <div className="flex items-center gap-1">
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={onMenuClick}
                    >
                        <MoreVertical className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}