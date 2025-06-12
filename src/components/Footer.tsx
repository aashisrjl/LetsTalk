
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">FT</span>
            </div>
            <span className="text-sm text-muted-foreground">
              LetsTalk - Connect with language learners worldwide
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 text-red-500" /> <a className="text-blue-700" href="http://aashishrijal.com.np" target="_blank">Aashis</a> for language learners
          </div>
        </div>
      </div>
    </footer>
  );
}
