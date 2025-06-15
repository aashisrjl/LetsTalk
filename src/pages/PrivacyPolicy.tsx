
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const PrivacyPolicy = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="language-app-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex-grow container mx-auto p-4">
          <Header onMenuClick={() => {}} />
          <main className="mt-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
            <div className="space-y-6 bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow-sm border">
              <p className="text-muted-foreground">
                At FreeTalk ("we", "us", "our"), we are committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our application.
              </p>
              
              <div>
                <h2 className="text-2xl font-semibold">
                  Information We Collect
                </h2>
                <p className="mt-2 text-muted-foreground">
                  When you register or log in to FreeTalk using a third-party service like Google or Facebook, we access and store the following information from your social media account, based on your permissions:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4 mt-4 text-muted-foreground">
                  <li>
                    <strong>Name:</strong> Your full name or display name to identify you within the application.
                  </li>
                  <li>
                    <strong>Email Address:</strong> Your primary email address for account verification and communication.
                  </li>
                  <li>
                    <strong>Profile Picture:</strong> Your public profile photo to personalize your user profile.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  How We Use Your Information
                </h2>
                <p className="mt-2 text-muted-foreground">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4 mt-4 text-muted-foreground">
                  <li>Create and manage your FreeTalk account.</li>
                  <li>Personalize your experience and display your profile to others in language rooms.</li>
                  <li>Provide customer support and respond to your inquiries.</li>
                  <li>Communicate important service-related notices.</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  We do not sell or rent your personal data to third parties. We will not share your information with any third party outside of our organization, other than as necessary to provide the service or as required by law.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold">
                  Data Security
                </h2>
                <p className="mt-2 text-muted-foreground">
                  We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access. Your account's security is also dependent on the security of the third-party service (Google or Facebook) you use to authenticate.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">
                  Changes to This Policy
                </h2>
                <p className="mt-2 text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default PrivacyPolicy;
