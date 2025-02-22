"use client";
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "./ui/glowing-effect";

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2.5xl border border-amber-100 bg-gradient-to-br from-amber-50/30 to-white p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glowColor="#f59e0b"
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-white/30 backdrop-blur-md p-6 shadow-[0px_0px_27px_0px_rgba(245,158,11,0.1)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg bg-amber-100/50 p-2.5 backdrop-blur-sm">{icon}</div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl/[1.375rem] font-bold font-sans text-amber-900 md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <p className="font-sans text-sm/[1.125rem] md:text-base/[1.375rem] text-amber-700/80">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function About() {
  return <GlowingEffectDemo />;
}

function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-5 w-5 text-amber-500" />}
        title="AI-Powered Receipt Processing"
        description="Uses Vision-Language Models (VLMs) to extract key details (vendor, amount, date, category) from receipts with high accuracy."
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-5 w-5 text-amber-500" />}
        title="Fraud Detection & Anomaly Analysis"
        description="Identifies duplicate receipts, outlier transactions, and suspicious spending patterns using machine learning-based fraud scoring."
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-5 w-5 text-amber-500" />}
        title="Automated Expense Approval Workflow"
        description="Employee uploads a receipt → Processed using  Vision-Language Models (VLMs) to extract details.
Extracted text is sent to the LLM, which validates the data and formats it into a structured expense report.
Fraud detection & policy compliance checks analyze the data for anomalies and policy violations.
Managers review the claim based on fraud scores and approve or reject it.
Automated notifications are sent to managers (for approval) and employees (for rejections with reasons).
Employees can interact with an AI chatbot for clarifications.
A manager dashboard provides real-time insights into trends, fraud patterns, and approvals."
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-5 w-5 text-amber-500" />}
        title="Policy Compliance Checks"
        description="Flags policy violations such as over-budget claims and unauthorized expenses using rule-based logic and ML classifiers."
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-5 w-5 text-amber-500" />}
        title="AI Chatbot for Expense Queries"
        description="Provides real-time, natural-language explanations for rejected claims, improving user experience and reducing confusion."
      />
    </ul>
  );
}
