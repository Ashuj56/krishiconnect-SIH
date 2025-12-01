import { BookOpen, Play, Search, ChevronRight, Leaf, Bug, Droplets, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image?: string;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
}

const categories = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "crops", label: "Crops", icon: Leaf },
  { id: "pests", label: "Pests", icon: Bug },
  { id: "irrigation", label: "Irrigation", icon: Droplets },
  { id: "weather", label: "Weather", icon: Sun },
];

const articles: Article[] = [
  { id: "1", title: "Complete Guide to Paddy Cultivation", category: "crops", readTime: "8 min read" },
  { id: "2", title: "Natural Pest Control Methods", category: "pests", readTime: "5 min read" },
  { id: "3", title: "Drip Irrigation Setup Guide", category: "irrigation", readTime: "10 min read" },
  { id: "4", title: "Monsoon Crop Management", category: "weather", readTime: "6 min read" },
  { id: "5", title: "Organic Fertilizer Preparation", category: "crops", readTime: "7 min read" },
];

const videos: Video[] = [
  { id: "1", title: "How to identify common rice diseases", duration: "12:30", views: "45K" },
  { id: "2", title: "Banana cultivation best practices", duration: "18:45", views: "32K" },
  { id: "3", title: "Setting up automated irrigation", duration: "15:20", views: "28K" },
];

const faqs = [
  { q: "When is the best time to plant paddy?", a: "The ideal time for paddy plantation in Kerala is June-July (Kharif) and October-November (Rabi)." },
  { q: "How often should I irrigate my crops?", a: "Irrigation frequency depends on crop type, soil, and weather. Use soil moisture as a guide." },
  { q: "How to prevent pest attacks naturally?", a: "Use neem-based sprays, maintain crop rotation, and encourage beneficial insects." },
];

export default function Knowledge() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredArticles = selectedCategory === "all" 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <p className="text-xs text-muted-foreground">Learn farming best practices</p>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles, videos..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Featured Articles */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Articles
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredArticles.slice(0, 4).map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-card transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{article.readTime}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Video Tutorials */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Video Tutorials
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="shrink-0 w-[200px] rounded-xl border overflow-hidden hover:shadow-card transition-all cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent/30 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary-foreground ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 text-xs bg-foreground/80 text-background px-2 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border overflow-hidden"
              >
                <button
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
                    expandedFaq === index && "rotate-90"
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
