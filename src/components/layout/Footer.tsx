import Link from "next/link";
import { Wheat, Facebook, Twitter, Instagram, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Wheat className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">
                Agrotourism
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect with nature, experience farm life, and create lasting
              memories.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/farms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Find Farms
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-primary"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">For Farmers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/list-farm"
                  className="text-muted-foreground hover:text-primary"
                >
                  List Your Farm
                </Link>
              </li>
              <li>
                <Link
                  href="/farmer-resources"
                  className="text-muted-foreground hover:text-primary"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/success-stories"
                  className="text-muted-foreground hover:text-primary"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/farmer-faq"
                  className="text-muted-foreground hover:text-primary"
                >
                  FAQ for Farmers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Agrotourism. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
