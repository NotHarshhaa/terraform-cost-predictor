"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Send } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function CreatorSection() {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Meet the Creator
          </h2>
          <p className="text-muted-foreground text-lg">
            Built with passion for the DevOps and Cloud community
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl border bg-card overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
              {/* Avatar */}
              <div className="shrink-0 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-violet-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <img
                  src="https://github.com/NotHarshhaa.png"
                  alt="H A R S H H A A"
                  className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background shadow-2xl object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-1">H A R S H H A A</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  DevOps Engineer • MLOps Specialist • Platform Engineering
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                  {["DevOps", "MLOps", "Platform Engineering", "Cloud Architecture", "Kubernetes"].map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <a href="https://github.com/NotHarshhaa" target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="h-4 w-4 mr-1.5" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <a href="https://www.linkedin.com/in/harshhaa-vardhan-reddy/" target="_blank" rel="noopener noreferrer">
                      <LinkedinIcon className="h-4 w-4 mr-1.5" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <a href="https://blog.prodevopsguy.xyz" target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-1.5" />
                      Blog
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <a href="https://t.me/prodevopsguy" target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4 mr-1.5" />
                      Telegram
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
