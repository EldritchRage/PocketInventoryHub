import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Star, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useHomepageConfig from '@/hooks/useHomepageConfig';
import HeroEditor from '@/components/homepage/HeroEditor';
import AboutEditor from '@/components/homepage/AboutEditor';
import FeaturedManager from '@/components/homepage/FeaturedManager';

export default function HomepageEditor() {
    const navigate = useNavigate();
    const {
        config,
        featuredProducts,
        loading,
        updateHero,
        updateAbout,
        publishFeaturedProducts
    } = useHomepageConfig();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold flex-1">Homepage Editor</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                <p className="text-sm text-muted-foreground mb-5">
                    Changes here control the hero, about, and featured-product sections on psitsavibe.com.
                </p>
                <Tabs defaultValue="hero" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="hero" className="flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            <span className="hidden sm:inline">Hero</span>
                        </TabsTrigger>
                        <TabsTrigger value="about" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">About</span>
                        </TabsTrigger>
                        <TabsTrigger value="featured" className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            <span className="hidden sm:inline">Featured</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero">
                        <HeroEditor initialData={config?.hero} onSave={updateHero} />
                    </TabsContent>

                    <TabsContent value="about">
                        <AboutEditor initialData={config?.about} onSave={updateAbout} />
                    </TabsContent>

                    <TabsContent value="featured" className="mt-0">
                        <div className="py-4">
                            <FeaturedManager
                                featuredItems={featuredProducts}
                                onPublish={publishFeaturedProducts}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
