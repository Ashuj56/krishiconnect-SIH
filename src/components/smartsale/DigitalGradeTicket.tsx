import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Copy, Share2, QrCode } from "lucide-react";
import { toast } from "sonner";

interface DigitalGradeTicketProps {
  ticket: {
    id: string;
    ticket_code: string;
    crop: string;
    quantity_kg: number;
    preliminary_grade: string;
    district: string;
    pincode: string;
    created_at: string;
  };
  onClose?: () => void;
}

export function DigitalGradeTicket({ ticket, onClose }: DigitalGradeTicketProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-500";
      case "B": return "bg-yellow-500";
      case "C": return "bg-orange-500";
      default: return "bg-muted";
    }
  };

  const copyTicketCode = () => {
    navigator.clipboard.writeText(ticket.ticket_code);
    toast.success("Ticket code copied to clipboard");
  };

  const shareTicket = async () => {
    const shareData = {
      title: "Grade Ticket - " + ticket.crop,
      text: `Grade Ticket: ${ticket.ticket_code}\nCrop: ${ticket.crop}\nQuantity: ${ticket.quantity_kg} kg\nGrade: ${ticket.preliminary_grade}\nDistrict: ${ticket.district}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyTicketCode();
      }
    } else {
      copyTicketCode();
    }
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="h-5 w-5 text-primary" />
            Digital Grade Ticket
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {new Date(ticket.created_at).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket Code Display */}
        <div className="rounded-xl bg-card border-2 border-dashed border-primary/40 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">TICKET CODE</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-wider text-primary">
              {ticket.ticket_code}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyTicketCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this code with the buyer for verification
          </p>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Crop</p>
            <p className="font-medium">{ticket.crop}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Quantity</p>
            <p className="font-medium">{ticket.quantity_kg} kg</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">District</p>
            <p className="font-medium">{ticket.district}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Pincode</p>
            <p className="font-medium">{ticket.pincode}</p>
          </div>
        </div>

        {/* Preliminary Grade */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-xs text-muted-foreground">Preliminary Grade</p>
            <p className="text-sm">Awaiting buyer verification</p>
          </div>
          <Badge className={`${getGradeColor(ticket.preliminary_grade)} text-white text-lg px-4 py-1`}>
            Grade {ticket.preliminary_grade}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={shareTicket}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Ticket
          </Button>
          {onClose && (
            <Button className="flex-1" onClick={onClose}>
              Continue to Sale Options
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
