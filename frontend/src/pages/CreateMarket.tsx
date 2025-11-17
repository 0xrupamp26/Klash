import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";

const CreateMarket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const categories = [
    "Tech Drama",
    "Politics",
    "Sports",
    "Entertainment",
    "Crypto",
    "AI",
    "Social Media",
    "Business",
  ];

  const suggestedTitles = [
    "Will OpenAI release GPT-5 this month?",
    "Will Taylor Swift announce new album?",
    "Will Bitcoin reach $150K by end of year?",
    "Will Elon sell another company?",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bungee mb-2">Create Market</h1>
          <p className="text-muted-foreground text-lg">
            Turn any controversy into a prediction market
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-base mb-2">
                    Market Question
                  </Label>
                  <Input
                    id="title"
                    placeholder="Will Elon Musk reply to Mark Zuckerberg's tweet?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg h-12"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Make it clear and specific. People should know exactly what they're betting on.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base mb-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide context and details about the controversy. Include relevant links or background info."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-32"
                  />
                </div>

                <div>
                  <Label className="text-base mb-3 block">Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={category === cat ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          category === cat 
                            ? "bg-gradient-klash shadow-glow" 
                            : "hover:border-primary"
                        }`}
                        onClick={() => setCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate" className="text-base mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="initialPool" className="text-base mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Initial Pool (USDC)
                    </Label>
                    <Input
                      id="initialPool"
                      type="number"
                      placeholder="100"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-gradient-to-br from-card to-secondary/20">
              <h3 className="text-xl font-bungee mb-4">Preview</h3>
              <div className="space-y-3">
                <div className="text-2xl font-bungee leading-tight">
                  {title || "Your market question will appear here"}
                </div>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
                {category && (
                  <Badge variant="outline">{category}</Badge>
                )}
              </div>
            </Card>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold bg-gradient-klash shadow-glow animate-glow-pulse"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Market
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bungee mb-4">💡 Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-klash">•</span>
                  <span>Make questions binary (Yes/No) for best results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-klash">•</span>
                  <span>Include a clear resolution criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-klash">•</span>
                  <span>Shorter time frames = more engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-klash">•</span>
                  <span>Viral topics get more traction</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bungee mb-4">🔥 Trending Now</h3>
              <div className="space-y-2">
                {suggestedTitles.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTitle(suggestion)}
                    className="w-full text-left text-sm p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarket;
