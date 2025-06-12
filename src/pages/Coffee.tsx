import { useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coffee, Copy, CheckCircle, Smartphone, CreditCard, Heart, Star, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Import the QR code images
import esewaQR from "@/assets/esewa.png";
import bankQR from "@/assets/bank.png";

const CoffeePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string>("");
  const { toast } = useToast();

  const paymentMethods = {
    esewa: {
      name: "eSewa/khalti/ImePay",
      id: "9847749997",
      icon: CreditCard,
      color: "text-green-600"
    },
    mobileBanking: {
      name: "Mobile Banking",
      account: "240070100002196",
      bank: "Global IME Bank Ltd",
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
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="container mx-auto p-2">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="flex mt-4">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="flex-1 lg:ml-0">
              <div className="p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                  {/* Page Header */}
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900">
                        <Coffee className="h-8 w-8 text-orange-600" />
                      </div>
                      <h1 className="text-4xl font-bold">Buy me a coffee ☕</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Support the development of LetsTalk and help keep this language learning platform running and improving for everyone.
                    </p>
                  </div>

                  {/* Why Support Section */}
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-center">
                        <Heart className="h-6 w-6 text-red-500" />
                        Why Your Support Matters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                            <Coffee className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Server Costs</h3>
                          <p className="text-sm text-muted-foreground">
                            Help cover hosting and infrastructure costs to keep LetsTalk running smoothly 24/7.
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                            <Star className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="font-semibold mb-2">New Features</h3>
                          <p className="text-sm text-muted-foreground">
                            Enable the development of exciting new features like AI pronunciation tools and more languages.
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                            <Heart className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Community</h3>
                          <p className="text-sm text-muted-foreground">
                            Support a free platform where language learners from around the world can connect and grow.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Methods */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* eSewa Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <paymentMethods.esewa.icon className={`h-6 w-6 ${paymentMethods.esewa.color}`} />
                          {paymentMethods.esewa.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">eSewa ID</p>
                              <p className="font-mono font-medium">{paymentMethods.esewa.id}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(paymentMethods.esewa.id, "eSewa ID")}
                            >
                              {copiedField === "eSewa ID" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Send any amount to support LetsTalk development. Every contribution helps!
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mobile Banking Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <paymentMethods.mobileBanking.icon className={`h-6 w-6 ${paymentMethods.mobileBanking.color}`} />
                          {paymentMethods.mobileBanking.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground">Account Number</p>
                              <p className="font-mono font-medium">{paymentMethods.mobileBanking.account}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(paymentMethods.mobileBanking.account, "Account Number")}
                            >
                              {copiedField === "Account Number" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Bank</p>
                            <p className="font-medium">{paymentMethods.mobileBanking.bank}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Use mobile banking to transfer funds. Account holder: FreeTalk Development
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* QR Code Section */}
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="text-center flex items-center justify-center gap-2">
                        <QrCode className="h-6 w-6" />
                        Quick Payment - QR Codes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
                          {/* eSewa QR Code */}
                          <div>
                            <img
                              src={esewaQR}
                              alt="eSewa QR Code"
                              className="w-48 h-60 mx-auto mb-4 rounded-lg border-2 border-dashed border-muted-foreground/30"
                            />
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              eSewa QR Code
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Scan with your eSewa app
                            </p>
                          </div>
                          {/* Global IME Bank QR Code */}
                          <div>
                            <img
                              src={bankQR}
                              alt="Global IME Bank QR Code"
                              className="w-48 h-60 mx-auto mb-4 rounded-lg border-2 border-dashed border-muted-foreground/30"
                            />
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              Global IME Bank QR Code
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Scan with your mobile banking app
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Scan the appropriate QR code with your eSewa or mobile banking app for quick and secure payment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Thank You Section */}
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Heart className="h-6 w-6 text-red-500" />
                        <h3 className="text-2xl font-bold">Thank You!</h3>
                        <Heart className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Your support means the world to us and helps keep LetsTalk free for everyone.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <span>✨ Made with love for language learners</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>🌍 Connecting cultures worldwide</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default CoffeePage;