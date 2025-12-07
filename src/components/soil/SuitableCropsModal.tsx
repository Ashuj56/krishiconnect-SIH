import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sprout } from "lucide-react";

interface SuitableCrop {
  name: string;
  nameMl: string;
  icon: string;
  reason: string;
  reasonMl: string;
}

interface SuitableCropsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crops: SuitableCrop[];
  language: string;
}

export function SuitableCropsModal({ open, onOpenChange, crops, language }: SuitableCropsModalProps) {
  const translations = {
    title: { en: "Suitable Crops", ml: "അനുയോജ്യമായ വിളകൾ" },
    subtitle: { en: "Based on your soil analysis", ml: "നിങ്ങളുടെ മണ്ണ് വിശകലനത്തിന്റെ അടിസ്ഥാനത്തിൽ" },
    noCrops: { en: "No suitable crops found for current soil conditions", ml: "നിലവിലെ മണ്ണ് സാഹചര്യങ്ങൾക്ക് അനുയോജ്യമായ വിളകൾ കണ്ടെത്തിയില്ല" },
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language === 'ml' ? 'ml' : 'en'];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
          {crops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noCrops')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {crops.map((crop, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{crop.icon}</span>
                    <div>
                      <h4 className="font-semibold text-sm">{crop.name}</h4>
                      <p className="text-xs text-muted-foreground font-malayalam">
                        {crop.nameMl}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {language === 'ml' ? crop.reasonMl : crop.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
