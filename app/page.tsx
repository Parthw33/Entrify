"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Scan,
  Users,
  Check,
  ArrowRight,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getProfileStats } from "@/app/actions/getProfileStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const session = useSession().data;
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    approvedFemaleStats: 0,
    approvedMaleStats: 0,
    totalMaleStats: 0,
    totalFemaleStats: 0,
    totalGuestCount: 0,
    maleGuestCount: 0,
    femaleGuestCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const data = await getProfileStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const features = [
    {
      icon: <Scan className="h-8 w-8" />,
      title: "QR कोड स्कॅनिंग",
      description:
        "सहभागींची नोंदणी आणि प्रवेश व्यवस्थापन करण्यासाठी QR कोड स्कॅनिंग",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "नोंदणी प्रक्रिया",
      description:
        "सुलभ ऑनलाइन नोंदणी प्रक्रिया आणि उमेदवार प्रोफाइल व्यवस्थापन",
    },
    {
      icon: <Check className="h-8 w-8" />,
      title: "परिचय माहिती",
      description: "रुचीनुसार परिचय सेवा आणि प्रोफाइल जुळवणी",
    },
  ];

  const eventDetails = [
    {
      icon: <Calendar className="h-5 w-5 text-primary" />,
      label: "दिनांक",
      value: "13 एप्रिल 2025",
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      label: "आयोजक",
      value: "आर्य वैश्य कोमटी समाज, पंढरपूर",
    },
  ];

  return (
    <main>
      {/* Hero Section with Gradient Overlay */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col items-center">
            {/* Banner Image */}
            <div className="w-full max-w-4xl mb-8">
              <Image
                src="https://res.cloudinary.com/ddrxbg3h9/image/upload/v1741503397/Sneh_melava_brpsgc.png"
                alt="स्नेहबंध मेळावा"
                className="w-full h-auto rounded-lg shadow-lg"
                width={1000}
                height={400}
                priority
              />
            </div>

            {/* Main Title and Description */}
            <div className="text-center max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                आर्य वैश्य कोमटी समाज पंढरपूर संचलित
                <span className="text-primary block mt-2">
                  स्नेहबंध पंढरपूर २०२५
                </span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                स्व. सुरेश (आबा) कौलवार यांच्या स्मरणार्थ आर्य वैश्य कोमटी समाज,
                पंढरपूर संचलित स्नेहबंध २०२५
              </p>

              {/* Event Details */}
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                {eventDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"
                  >
                    {detail.icon}
                    <span className="font-medium">{detail.label}:</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {/* Only show buttons for authenticated users with non-default role */}
                {session &&
                session.user &&
                session.user.role &&
                session.user.role !== "default" ? (
                  <>
                    <Link href="/dashboard">
                      <Button size="lg" className="gap-2 h-12 px-6">
                        Get Started (QR कोड Scan)
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 h-12 px-6 border-2"
                      >
                        New Registration (नोंदणी करा)
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    size="lg"
                    className="gap-2 h-12 px-6"
                  >
                    Sign In to Access
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Stats Section */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">
                  Registration Statistics
                </h3>

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg shadow-sm border p-4"
                      >
                        <Skeleton className="h-6 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {/* Total Registrations */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium text-blue-800">
                          Total Registrations
                        </h4>
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="p-4">
                        <p className="text-3xl font-bold text-blue-800">
                          {stats?.total}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600"
                          >
                            Male: {stats?.totalMaleStats}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-pink-50 text-pink-600"
                          >
                            Female: {stats?.totalFemaleStats}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium text-green-800">
                          Approved Profiles
                        </h4>
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="p-4">
                        <p className="text-3xl font-bold text-green-800">
                          {stats?.approved}
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            (
                            {Math.round(
                              (stats?.approved / (stats?.total || 1)) * 100
                            )}
                            %)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600"
                          >
                            Male: {stats.approvedMaleStats}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-pink-50 text-pink-600"
                          >
                            Female: {stats.approvedFemaleStats}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="bg-amber-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium text-amber-800">
                          Pending Approval
                        </h4>
                        <UserX className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="p-4">
                        <p className="text-3xl font-bold text-amber-800">
                          {stats.pending}
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            (
                            {Math.round(
                              (stats?.pending / (stats?.total || 1)) * 100
                            )}
                            %)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600"
                          >
                            Male:{" "}
                            {stats?.totalMaleStats - stats?.approvedMaleStats}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-pink-50 text-pink-600"
                          >
                            Female:{" "}
                            {stats?.totalFemaleStats -
                              stats?.approvedFemaleStats}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Guest Count */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="bg-purple-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium text-purple-800">
                          Total Guests
                        </h4>
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="p-4">
                        <p className="text-3xl font-bold text-purple-800">
                          {stats?.totalGuestCount}
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            (Approved Only)
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600"
                          >
                            With Male: {stats?.maleGuestCount}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-pink-50 text-pink-600"
                          >
                            With Female: {stats?.femaleGuestCount}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">Website Insights</h2>
            <div className="mt-2 h-1 w-16 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                href={
                  session &&
                  session.user &&
                  session.user.role &&
                  session.user.role !== "default"
                    ? feature.title === "QR कोड स्कॅनिंग"
                      ? "/dashboard"
                      : feature.title === "नोंदणी प्रक्रिया"
                      ? "/register"
                      : "#"
                    : "/auth/signin"
                }
                key={index}
                className="block hover:no-underline"
              >
                <Card className="border bg-white shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                    {!session ||
                    !session.user ||
                    !session.user.role ||
                    session.user.role === "default" ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sign in required to access
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            आमच्या स्नेहबंध कार्यक्रमात सहभागी व्हा
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            स्नेहबंध मेळाव्यात सहभागी होण्यासाठी आज आपली नोंदणी करा आणि आपल्या
            भविष्यातील जोडीदारास भेटण्याची संधी मिळवा.
          </p>
          <div className="mt-8">
            {session &&
            session.user &&
            session.user.role &&
            session.user.role !== "default" ? (
              <Link href="/register">
                <Button size="lg" className="gap-2 h-12 px-8">
                  आता नोंदणी करा
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                size="lg"
                className="gap-2 h-12 px-6"
              >
                Sign In to Register
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
