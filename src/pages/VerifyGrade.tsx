import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle2, Package, MapPin, Scale, Ticket, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TicketData {
  id: string;
  ticket_code: string;
  crop: string;
  quantity_kg: number;
  preliminary_grade: string;
  district: string;
  pincode: string;
  created_at: string;
  harvest_batches: {
    id: string;
    final_grade: string | null;
    farmer_id: string;
  };
}

export default function VerifyGrade() {
  const [ticketCode, setTicketCode] = useState("");
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const searchTicket = async () => {
    if (!ticketCode.trim()) {
      toast.error("Please enter a ticket code");
      return;
    }

    setLoading(true);
    setTicket(null);
    setVerified(false);

    try {
      const { data, error } = await supabase.functions.invoke('grade-ticket', {
        body: { action: 'get', ticket_code: ticketCode.trim() }
      });

      if (error || data.error) {
        toast.error(data?.error || "Ticket not found");
        return;
      }

      setTicket(data.ticket);
      if (data.ticket.harvest_batches?.final_grade) {
        setSelectedGrade(data.ticket.harvest_batches.final_grade);
        setVerified(true);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      toast.error("Failed to fetch ticket");
    } finally {
      setLoading(false);
    }
  };

  const submitFinalGrade = async () => {
    if (!selectedGrade) {
      toast.error("Please select a final grade");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('grade-ticket', {
        body: { 
          action: 'verify', 
          ticket_code: ticketCode.trim(),
          final_grade: selectedGrade 
        }
      });

      if (error || data.error) {
        toast.error(data?.error || "Failed to submit grade");
        return;
      }

      toast.success("Final grade submitted successfully");
      setVerified(true);
    } catch (err) {
      console.error('Error submitting grade:', err);
      toast.error("Failed to submit grade");
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-500";
      case "B": return "bg-yellow-500";
      case "C": return "bg-orange-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Verify Grade</h1>
          <p className="text-muted-foreground">
            Enter ticket code to verify and assign final grade
          </p>
        </div>

        {/* Search Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5 text-primary" />
              Enter Ticket Code
            </CardTitle>
            <CardDescription>
              Get the ticket code from the farmer to verify their harvest batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 8-character code (e.g., ABC12345)"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-wider"
                maxLength={8}
              />
              <Button onClick={searchTicket} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        {ticket && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Batch Details</CardTitle>
                <Badge variant="outline" className="font-mono">
                  {ticket.ticket_code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Batch Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Crop</p>
                    <p className="font-medium">{ticket.crop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">{ticket.quantity_kg} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">District</p>
                    <p className="font-medium">{ticket.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pincode</p>
                    <p className="font-medium">{ticket.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Preliminary Grade */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Farmer's Preliminary Grade</p>
                  <p className="text-xs text-muted-foreground">Based on self-assessment questionnaire</p>
                </div>
                <Badge className={`${getGradeColor(ticket.preliminary_grade)} text-white`}>
                  Grade {ticket.preliminary_grade}
                </Badge>
              </div>

              <Separator />

              {/* Final Grade Selection */}
              {verified ? (
                <div className="flex items-center justify-between rounded-lg border-2 border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Final Grade Verified</p>
                      <p className="text-xs text-muted-foreground">
                        This batch has been graded by a verified buyer
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getGradeColor(selectedGrade)} text-white text-lg px-4`}>
                    Grade {selectedGrade}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Assign Final Grade</h4>
                    <p className="text-sm text-muted-foreground">
                      Inspect the produce and assign the verified grade
                    </p>
                  </div>
                  <RadioGroup
                    value={selectedGrade}
                    onValueChange={setSelectedGrade}
                    className="flex gap-4"
                  >
                    {["A", "B", "C"].map((grade) => (
                      <div
                        key={grade}
                        className={`flex-1 cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                          selectedGrade === grade
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={grade} id={`grade-${grade}`} className="sr-only" />
                        <Label htmlFor={`grade-${grade}`} className="cursor-pointer">
                          <Badge className={`${getGradeColor(grade)} text-white mb-2`}>
                            Grade {grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {grade === "A" && "Premium Quality"}
                            {grade === "B" && "Standard Quality"}
                            {grade === "C" && "Economy Quality"}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button 
                    className="w-full" 
                    onClick={submitFinalGrade}
                    disabled={!selectedGrade || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submit Final Grade
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!ticket && !loading && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="font-medium">How it works</h3>
                <ol className="text-sm text-muted-foreground text-left space-y-2 max-w-md mx-auto">
                  <li>1. Get the 8-character ticket code from the farmer</li>
                  <li>2. Enter the code above to fetch batch details</li>
                  <li>3. Physically inspect the produce quality</li>
                  <li>4. Assign the final grade (A, B, or C)</li>
                  <li>5. Submit to update the farmer's sale options</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
