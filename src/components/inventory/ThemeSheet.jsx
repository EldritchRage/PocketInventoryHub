import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ThemeSheet({ open, onClose }) {
    const { theme, setTheme, themes } = useTheme();

    const themeList = [
        { key: 'light', label: 'White', ring: '#2563EB', bg: '#F7F7F9', inner: '#2563EB' },
        { key: 'midnight', label: 'Midnight Blue', ring: '#38BDF8', bg: '#020617', inner: '#38BDF8' },
        { key: 'hotpink', label: 'Hot Pink', ring: '#EC4899', bg: '#1F0024', inner: '#EC4899' },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm mx-auto rounded-t-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">Choose Theme</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center gap-6 py-4">
                    {themeList.map(t => (
                        <button
                            key={t.key}
                            onClick={() => {
                                setTheme(t.key);
                                onClose(false);
                            }}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div
                                className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-200 ${theme === t.key ? 'scale-110' : 'opacity-70 group-hover:opacity-100'
                                    }`}
                                style={{
                                    borderColor: theme === t.key ? t.ring : 'transparent',
                                    backgroundColor: t.bg,
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: t.inner }}
                                />
                                {theme === t.key && (
                                    <Check
                                        className="absolute h-3.5 w-3.5"
                                        style={{ color: t.bg }}
                                    />
                                )}
                            </div>
                            <span className={`text-xs font-medium ${theme === t.key ? 'text-primary' : 'text-muted-foreground'}`}>
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}