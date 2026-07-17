import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function HeroEditor({ initialData, onSave }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        headline: initialData?.headline || '',
        subheading: initialData?.subheading || '',
        buttonText: initialData?.buttonText || '',
        buttonLink: initialData?.buttonLink || '',
        image: initialData?.image || '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialData?.image || null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(data, imageFile);
            toast.success('Hero banner updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update hero banner');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border/60 bg-secondary/10 p-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Hero Image</Label>
                    <div className="relative aspect-[21/9] rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">Click to upload banner</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {previewUrl && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Change Image</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="headline" className="text-sm font-medium">Headline</Label>
                    <Input
                        id="headline"
                        value={data.headline}
                        onChange={(e) => setData({ ...data, headline: e.target.value })}
                        placeholder="e.g. Discover Your Vibe"
                        className="h-11 rounded-lg"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="subheading" className="text-sm font-medium">Subheading</Label>
                    <Input
                        id="subheading"
                        value={data.subheading}
                        onChange={(e) => setData({ ...data, subheading: e.target.value })}
                        placeholder="e.g. Shop unique collections"
                        className="h-11 rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="buttonText" className="text-sm font-medium">Button Text</Label>
                        <Input
                            id="buttonText"
                            value={data.buttonText}
                            onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                            placeholder="e.g. Shop Now"
                            className="h-11 rounded-lg"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="buttonLink" className="text-sm font-medium">Button Link</Label>
                        <Input
                            id="buttonLink"
                            value={data.buttonLink}
                            onChange={(e) => setData({ ...data, buttonLink: e.target.value })}
                            placeholder="e.g. /shop.html"
                            className="h-11 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Hero Changes'}
            </Button>
        </form>
    );
}
