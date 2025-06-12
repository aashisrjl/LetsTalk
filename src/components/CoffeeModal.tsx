
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coffee, Copy, CheckCircle, Smartphone, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
  const [copiedField, setCopiedField] = useState<string>("");
  const { toast } = useToast();

  const paymentMethods = {
    esewa: {
      name: "eSewa",
      id: "9841234567",
      icon: CreditCard,
      color: "text-green-600"
    },
    mobileBanking: {
      name: "Mobile Banking",
      account: "01-12-345678-90",
      bank: "Nepal Investment Bank",
      icon: Smartphone,
      color: "text-blue-600"
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <Coffee className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-left text-xl">Buy me a coffee ☕</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Support the development of FreeTalk
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Your support helps keep FreeTalk running and improving. Thank you! 🙏
          </p>

          <Separator />

          {/* eSewa Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <paymentMethods.esewa.icon className={`h-5 w-5 ${paymentMethods.esewa.color}`} />
              <h3 className="font-semibold">{paymentMethods.esewa.name}</h3>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">eSewa ID</p>
                  <p className="font-mono font-medium">{paymentMethods.esewa.id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentMethods.esewa.id, "eSewa ID")}
                  className="ml-2"
                >
                  {copiedField === "eSewa ID" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mobile Banking Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <paymentMethods.mobileBanking.icon className={`h-5 w-5 ${paymentMethods.mobileBanking.color}`} />
              <h3 className="font-semibold">{paymentMethods.mobileBanking.name}</h3>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-mono font-medium">{paymentMethods.mobileBanking.account}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentMethods.mobileBanking.account, "Account Number")}
                  className="ml-2"
                >
                  {copiedField === "Account Number" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{paymentMethods.mobileBanking.bank}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentMethods.mobileBanking.bank, "Bank Name")}
                  className="ml-2"
                >
                  {copiedField === "Bank Name" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* QR Code Placeholder */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">QR Code</h3>
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                <div className="text-center">
                  <Coffee className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
