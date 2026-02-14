import React from "react";
import { useState } from "react";
import { HEAD, HAIR, EYES, MOUTH, BODY_IDLE } from "@/data/characterAssets";

export default function CharacterPreview() {
  const [selectedHair, setSelectedHair] = useState(0);
  const [selectedEyes, setSelectedEyes] = useState(0);
  const [selectedMouth, setSelectedMouth] = useState(0);

  return (
    <div className="relative w-[256px] h-[256px]">
      {/* LEGS */}
      <img
        src={BODY_IDLE.legs[0].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="legs bg"
      />
      <img
        src={BODY_IDLE.legs[0].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="legs outline"
      />

      {/* BOTTOM */}
      <img
        src={BODY_IDLE.bottom[0].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="bottom bg"
      />
      <img
        src={BODY_IDLE.bottom[0].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="bottom outline"
      />

      {/* TOP */}
      <img
        src={BODY_IDLE.top[0].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="top bg"
      />
      <img
        src={BODY_IDLE.top[0].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="top outline"
      />

      {/* ARMS */}
      <img
        src={BODY_IDLE.arms[0].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="arms bg"
      />
      <img
        src={BODY_IDLE.arms[0].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="arms outline"
      />
      <img
        src={HEAD[0].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="head background"
      />
      <img
        src={HEAD[0].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="head outline"
      />
      <img
        src={EYES[selectedEyes]}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="eyes"
      />
      <img
        src={MOUTH[selectedMouth]}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="mouth"
      />
      <img
        src={HAIR[selectedHair].bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="hair background"
      />
      <img
        src={HAIR[selectedHair].outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="hair outline"
      />
    </div>
  );
}
