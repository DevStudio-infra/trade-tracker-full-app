"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";

import "driver.js/dist/driver.css";

export function CopilotWalkthrough() {
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);

  useEffect(() => {
    // Check if user has seen the walkthrough
    const hasSeenTour = localStorage.getItem("hasSeenCopilotTour");
    if (hasSeenTour) {
      setHasSeenWalkthrough(true);
      return;
    }

    // Initialize driver.js
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "#chart-window",
          popover: {
            title: "Chart Window",
            description:
              "Lock your trading chart window here. The AI will analyze any changes in real-time.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#auto-analysis",
          popover: {
            title: "Auto Analysis",
            description:
              "When enabled, the AI will automatically analyze new chart captures with your last prompt.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#analysis-form",
          popover: {
            title: "Analysis Options",
            description:
              "Choose between analyzing new trading opportunities or getting guidance for active trades.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#session-manager",
          popover: {
            title: "Session Management",
            description:
              "Create and switch between different analysis sessions to organize your trading research.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#session-history",
          popover: {
            title: "Analysis History",
            description:
              "View and compare all your previous analyses within the current session.",
            side: "left",
            align: "start",
          },
        },
      ],
      onDestroyed: () => {
        // Save that user has seen the walkthrough
        localStorage.setItem("hasSeenCopilotTour", "true");
        setHasSeenWalkthrough(true);
      },
    });

    // Start the walkthrough
    driverObj.drive();

    // Cleanup function
    return () => {
      driverObj.destroy();
    };
  }, []);

  return null; // This is a utility component, no UI needed
}
