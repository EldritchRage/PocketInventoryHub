import React from 'react';
import { Palette, Star, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function MenuSheet({ open, onClose, onTheme, onSpotlight }) {
    const navigate = useNavigate();
    const items = [
        { icon: Home, label: 'Edit Homepage', action: () => navigate('/homepage') },
        { icon: Star, label: 'Seasonal Spotlight', action: onSpotlight },
        { icon: Palette, label: 'Change Theme', action: onTheme },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm mx-auto rounded-t-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">Menu</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1 -mx-2">
                    {items.map(item => (
                        <button
                            key={item.label}
                            onClick={() => {
                                item.action();
                                onClose(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-secondary transition-colors duration-150"
                        >
                            <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
