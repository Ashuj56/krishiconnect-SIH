import { BookOpen, Play, Search, ChevronRight, Leaf, Bug, Droplets, Sun, ExternalLink, Youtube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Article {
  id: string;
  title: string;
  titleMl?: string;
  category: string;
  readTime: string;
  source: string;
  url: string;
  description: string;
}

interface Video {
  id: string;
  title: string;
  titleMl?: string;
  duration: string;
  channel: string;
  youtubeId: string;
  thumbnail: string;
}

const categories = [
  { id: "all", label: "All", labelMl: "എല്ലാം", icon: BookOpen },
  { id: "crops", label: "Crops", labelMl: "വിളകൾ", icon: Leaf },
  { id: "pests", label: "Pests", labelMl: "കീടങ്ങൾ", icon: Bug },
  { id: "irrigation", label: "Irrigation", labelMl: "ജലസേചനം", icon: Droplets },
  { id: "organic", label: "Organic", labelMl: "ജൈവകൃഷി", icon: Sun },
];

const articles: Article[] = [
  { 
    id: "1", 
    title: "How Kerala is Putting Organic Farming in Mission Mode", 
    titleMl: "കേരളം ജൈവകൃഷിയെ മിഷൻ മോഡിൽ എങ്ങനെ നടപ്പാക്കുന്നു",
    category: "organic", 
    readTime: "8 min", 
    source: "India Today",
    url: "https://www.indiatoday.in/india-today-insight/story/how-kerala-is-putting-organic-farming-in-mission-mode-2462819-2023-11-14",
    description: "Kerala's ambitious push towards sustainable agriculture and organic farming practices."
  },
  { 
    id: "2", 
    title: "Tribal Hamlet's Organic Farming Triumph in Chalakudy", 
    titleMl: "ചാലക്കുടിയിലെ ആദിവാസി ജൈവകൃഷി വിജയം",
    category: "organic", 
    readTime: "6 min", 
    source: "The Hindu",
    url: "https://www.thehindu.com/news/national/kerala/adichilthotti-tribal-hamlets-organic-triumph/article69932747.ece",
    description: "How Adichilthotti tribal settlement won Kerala State Farm Awards for organic farming excellence."
  },
  { 
    id: "3", 
    title: "Smart Farming: Young Farmer from Kannur Reaps Gold", 
    titleMl: "സ്മാർട്ട് കൃഷി: കണ്ണൂരിലെ യുവ കർഷകന്റെ വിജയകഥ",
    category: "crops", 
    readTime: "10 min", 
    source: "Onmanorama",
    url: "https://www.onmanorama.com/news/kerala/2025/11/05/smart-farm-aneesh-farming-success.html",
    description: "Technology and tenacity help PB Aneesh achieve farming success with modern techniques."
  },
  { 
    id: "4", 
    title: "Sustainable Model Farm: Kerala Youth's Inspiring Story", 
    titleMl: "സുസ്ഥിര മാതൃകാ ഫാം: കേരള യുവാവിന്റെ പ്രചോദനകഥ",
    category: "crops", 
    readTime: "5 min", 
    source: "Onmanorama",
    url: "https://www.onmanorama.com/news/kerala/2025/11/06/kerala-farmer-youth-sustainable-model-farm-agriculture.html",
    description: "31-year-old Rithul grows vegetables and rears livestock on his small farm in Thrissur."
  },
  { 
    id: "5", 
    title: "Pokkali Rice: Kerala's Ancient Organic Rice Variety", 
    titleMl: "പൊക്കാളി അരി: കേരളത്തിന്റെ പുരാതന ജൈവ അരി",
    category: "crops", 
    readTime: "7 min", 
    source: "PLDA Kerala",
    url: "https://pldakerala.com/about-pokkali/",
    description: "Learn about the 3,000-year-old indigenous rice variety grown in Kerala's coastal saline wetlands."
  },
  { 
    id: "6", 
    title: "Rice Cultivation in Kole Wetlands of Kerala", 
    titleMl: "കേരളത്തിലെ കോൾ നിലങ്ങളിലെ നെൽകൃഷി",
    category: "irrigation", 
    readTime: "12 min", 
    source: "Foundation for Agrarian Studies",
    url: "https://fas.org.in/rice-cultivation-in-kole-wetlands-of-kerala/",
    description: "Comprehensive guide to rice farming in the unique wetland ecosystem of Kerala."
  },
  { 
    id: "7", 
    title: "Natural Farming Summit: Blueprint for Sustainable Agriculture", 
    titleMl: "പ്രകൃതി കൃഷി ഉച്ചകോടി: സുസ്ഥിര കൃഷിയുടെ രൂപരേഖ",
    category: "organic", 
    readTime: "8 min", 
    source: "The Hindu",
    url: "https://www.thehindu.com/news/cities/Coimbatore/south-india-natural-farming-summit-stakeholders-submit-blueprint-to-prime-minister/article70308105.ece",
    description: "Insights from the South India Natural Farming Summit on organic inputs and pest control."
  },
  { 
    id: "8", 
    title: "Coconut-Based Integrated Farming Systems in Kerala", 
    titleMl: "കേരളത്തിലെ തെങ്ങ് അധിഷ്ഠിത സംയോജിത കൃഷി",
    category: "crops", 
    readTime: "15 min", 
    source: "ScienceDirect",
    url: "https://www.sciencedirect.com/science/article/pii/S2772411522000040",
    description: "Nature-based solutions in agriculture focusing on coconut farming systems."
  },
];

const videos: Video[] = [
  { 
    id: "1", 
    title: "Integrated Farming System - Kerala Agricultural University", 
    titleMl: "സംയോജിത കൃഷി - കേരള കാർഷിക സർവകലാശാല",
    duration: "15:30", 
    channel: "KAU Official",
    youtubeId: "UF6laJn9uSs",
    thumbnail: "https://img.youtube.com/vi/UF6laJn9uSs/mqdefault.jpg"
  },
  { 
    id: "2", 
    title: "Terrace Farming Complete Guide", 
    titleMl: "മട്ടുപ്പാവ് കൃഷി - സമ്പൂർണ്ണ ഗൈഡ്",
    duration: "12:45", 
    channel: "KAU Official",
    youtubeId: "K-H7_scQ494",
    thumbnail: "https://img.youtube.com/vi/K-H7_scQ494/mqdefault.jpg"
  },
  { 
    id: "3", 
    title: "Drumstick (Moringa) Cultivation", 
    titleMl: "മുരിങ്ങ കൃഷി",
    duration: "10:20", 
    channel: "KAU Official",
    youtubeId: "LHaW9guJ9Zs",
    thumbnail: "https://img.youtube.com/vi/LHaW9guJ9Zs/mqdefault.jpg"
  },
  { 
    id: "4", 
    title: "Coconut Based Integrated Farming Model", 
    titleMl: "തെങ്ങ് അധിഷ്ഠിത സംയോജിത കൃഷി മാതൃക",
    duration: "18:15", 
    channel: "IFSRS Karamana",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/UF6laJn9uSs/mqdefault.jpg"
  },
  { 
    id: "5", 
    title: "Gac Fruit Farming - High Value Crop", 
    titleMl: "ഗാക് ഫ്രൂട്ട് കൃഷി - ഉയർന്ന വിലയുള്ള വിള",
    duration: "8:30", 
    channel: "Asianet News",
    youtubeId: "N-GBdtEubF4",
    thumbnail: "https://img.youtube.com/vi/N-GBdtEubF4/mqdefault.jpg"
  },
  { 
    id: "6", 
    title: "Coconut Harvesting & Processing", 
    titleMl: "തേങ്ങ വിളവെടുപ്പും സംസ്കരണവും",
    duration: "14:50", 
    channel: "Modern Agriculture",
    youtubeId: "IdrKqZ_q6v0",
    thumbnail: "https://img.youtube.com/vi/IdrKqZ_q6v0/mqdefault.jpg"
  },
  { 
    id: "7", 
    title: "Basmati Rice Farming Complete Guide", 
    titleMl: "ബസ്മതി അരി കൃഷി സമ്പൂർണ്ണ ഗൈഡ്",
    duration: "16:40", 
    channel: "Agriculture Guide",
    youtubeId: "cD7m1QEQKk4",
    thumbnail: "https://img.youtube.com/vi/cD7m1QEQKk4/mqdefault.jpg"
  },
];

const faqs = [
  { 
    q: "When is the best time to plant paddy in Kerala?",
    qMl: "കേരളത്തിൽ നെല്ല് നടാൻ ഏറ്റവും നല്ല സമയം എപ്പോഴാണ്?", 
    a: "Kerala has three paddy seasons: Virippu (April-May to September-October), Mundakan (September-October to December-January), and Puncha (December-January to March-April). Mundakan season has the highest production.",
    aMl: "കേരളത്തിൽ മൂന്ന് നെൽകൃഷി സീസണുകളുണ്ട്: വിരിപ്പ്, മുണ്ടകൻ, പുഞ്ച. മുണ്ടകൻ സീസണിലാണ് ഏറ്റവും കൂടുതൽ ഉത്പാദനം."
  },
  { 
    q: "What are the main crops grown in Kerala?",
    qMl: "കേരളത്തിൽ കൃഷി ചെയ്യുന്ന പ്രധാന വിളകൾ ഏതൊക്കെ?", 
    a: "The main crops are Coconut, Paddy, Banana, Rubber, Pepper, Cardamom, Cashew, Arecanut, Mango, and Jackfruit. Coconut is the most important crop in Kerala.",
    aMl: "പ്രധാന വിളകൾ തെങ്ങ്, നെല്ല്, വാഴ, റബ്ബർ, കുരുമുളക്, ഏലം, കശുവണ്ടി, കമുക്, മാങ്ങ, ചക്ക എന്നിവയാണ്."
  },
  { 
    q: "How to start organic farming in Kerala?",
    qMl: "കേരളത്തിൽ ജൈവകൃഷി എങ്ങനെ തുടങ്ങാം?", 
    a: "Start with natural inputs like jeevamruth, ghanjeevamruth, cow dung, farmyard manure, green manures, and botanical extracts for pest control. Kerala government offers support through the National Mission on Natural Farming.",
    aMl: "ജീവാമൃതം, ഘനജീവാമൃതം, ചാണകം, പച്ചില വളങ്ങൾ, സസ്യ അധിഷ്ഠിത കീടനാശിനികൾ എന്നിവ ഉപയോഗിച്ച് തുടങ്ങുക."
  },
  { 
    q: "What is Pokkali rice cultivation?",
    qMl: "പൊക്കാളി നെൽകൃഷി എന്താണ്?", 
    a: "Pokkali is a unique 3,000-year-old indigenous rice variety grown in coastal saline wetlands of Ernakulam, Thrissur, and Alappuzha districts. It's cultivated organically using traditional practices.",
    aMl: "പൊക്കാളി 3,000 വർഷം പഴക്കമുള്ള തനത് നെല്ലിനമാണ്, എറണാകുളം, തൃശ്ശൂർ, ആലപ്പുഴ ജില്ലകളിലെ കായൽ പ്രദേശങ്ങളിൽ കൃഷി ചെയ്യുന്നു."
  },
];

export default function Knowledge() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter(a => {
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery === "" || matchesSearch);
  });

  const openYouTubeVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  const openArticle = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <p className="text-xs text-muted-foreground font-malayalam">കൃഷി അറിവുകൾ • Learn farming best practices</p>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' Kerala farming agriculture')}`, '_blank');
              }
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search on Google..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-12 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </form>
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

        {/* Video Tutorials */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-500/10">
                  <Youtube className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <span>Video Tutorials</span>
                  <p className="text-xs font-normal text-muted-foreground font-malayalam">വീഡിയോ പാഠങ്ങൾ</p>
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => openYouTubeVideo(video.youtubeId)}
                  className="shrink-0 w-[220px] rounded-xl border overflow-hidden hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 text-xs bg-black/80 text-white px-2 py-0.5 rounded font-medium">
                      {video.duration}
                    </span>
                    <div className="absolute top-2 left-2">
                      <Youtube className="w-5 h-5 text-red-500 drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3 bg-card">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 font-malayalam line-clamp-1">
                      {video.titleMl}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {video.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Articles */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span>Articles & Guides</span>
                  <p className="text-xs font-normal text-muted-foreground font-malayalam">ലേഖനങ്ങളും ഗൈഡുകളും</p>
                </div>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {filteredArticles.length} articles
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No articles found for this category</p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => openArticle(article.url)}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-card hover:border-primary/20 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-malayalam line-clamp-1">
                      {article.titleMl}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{article.readTime}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/50">
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span>Frequently Asked Questions</span>
                <p className="text-xs font-normal text-muted-foreground font-malayalam">പതിവ് ചോദ്യങ്ങൾ</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border overflow-hidden"
              >
                <button
                  className="w-full p-4 text-left flex items-start justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex-1 pr-4">
                    <span className="font-medium text-sm block">{faq.q}</span>
                    <span className="text-xs text-muted-foreground font-malayalam mt-0.5 block">{faq.qMl}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5 text-muted-foreground shrink-0 transition-transform mt-1",
                    expandedFaq === index && "rotate-90"
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-sm text-foreground">{faq.a}</p>
                    <p className="text-xs text-muted-foreground font-malayalam mt-2">{faq.aMl}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-0 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Official Resources</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-3"
              onClick={() => window.open('https://kau.in', '_blank')}
            >
              <Leaf className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs font-medium">KAU</p>
                <p className="text-xs text-muted-foreground">Kerala Agri University</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start gap-2 h-auto py-3"
              onClick={() => window.open('https://keralaagriculture.gov.in', '_blank')}
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs font-medium">Dept. of Agri</p>
                <p className="text-xs text-muted-foreground">Kerala Government</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
