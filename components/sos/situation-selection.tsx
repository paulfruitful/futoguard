"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { MobileHeader } from "@/components/mobile-header";

const situations = [
  "I'm being robbed",
  "I was in an accident",
  "I need medical attention",
];

const SituationSelection = () => {
  const [selectedSituation, setSelectedSituation] = useState("");
  const [customSituation, setCustomSituation] = useState("");
  return (
    <div>
      <h3 className="font-semibold mb-3 text-center">What's the situation?</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {situations.map((situation) => (
          <Card key={situation} onClick={() => setSelectedSituation(situation)}>
            <CardContent className="p-4">
              <p className="text-xs font-bold text-center"> {situation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Input */}
      <div className="flex space-x-2">
        <Input
          placeholder="What's the situation?"
          value={customSituation}
          onChange={(e) => setCustomSituation(e.target.value)}
          className="flex-1"
        />
        <Button size="icon" className="bg-red-500 hover:bg-red-600">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SituationSelection;
