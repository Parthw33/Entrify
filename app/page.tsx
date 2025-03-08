"use client";

import { auth } from "@/auth";
import InstallPWA from "@/components/installPWA";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Scan, BarChart3, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession().data;

  console.log(session);
  const features = [
    {
      icon: <Scan className="h-8 w-8" />,
      title: "QR Code Scanning",
      description:
        "Scan and process QR codes instantly with real-time detection",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Data Analytics",
      description:
        "Comprehensive analytics and reporting for your business needs",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Enterprise-grade security for your sensitive data",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="gradient-bg absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-5 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Modern SaaS Platform for Business Excellence
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Transform your business operations with our advanced QR code
              scanning and data management platform. Streamline processes and
              gain valuable insights.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
