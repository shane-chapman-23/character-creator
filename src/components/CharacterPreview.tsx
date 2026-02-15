import React from "react";
import { useState } from "react";
import { HEAD, HAIR, EYES, MOUTH, BODY_IDLE } from "@/data/characterAssets";

export default function CharacterPreview() {
  const [selectedHair, setSelectedHair] = useState(0);
  const [selectedEyes, setSelectedEyes] = useState(0);
  const [selectedMouth, setSelectedMouth] = useState(0);

  return (
    <div className="relative w-[256px] h-[256px]">
      {/* Draw order is intentional: back-to-front layering for a single composite sprite. */}
      {/* LEGS */}
      <img
        src={BODY_IDLE.legs[0].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="legs background"
      />
      <img
        src={BODY_IDLE.legs[0].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="legs outline"
      />

      {/* BOTTOM */}
      <img
        src={BODY_IDLE.bottom[0].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="bottom background"
      />
      <img
        src={BODY_IDLE.bottom[0].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="bottom outline"
      />

      {/* TOP */}
      <img
        src={BODY_IDLE.top[0].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="top background"
      />
      <img
        src={BODY_IDLE.top[0].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="top outline"
      />

      {/* ARMS */}
      <img
        src={BODY_IDLE.arms[0].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="arms background"
      />
      <img
        src={BODY_IDLE.arms[0].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="arms outline"
      />
      {/* Head and face details sit above torso layers but below hair. */}
      <img
        src={HEAD[0].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="head background"
      />
      <img
        src={HEAD[0].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="head outline"
      />
      <img
        src={EYES[selectedEyes].value}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="eyes"
      />
      <img
        src={MOUTH[selectedMouth].value}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="mouth"
      />
      <img
        src={HAIR[selectedHair].value.bg}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="hair background"
      />
      <img
        src={HAIR[selectedHair].value.outline}
        className="absolute inset-0 w-full h-full pixel-art"
        alt="hair outline"
      />
    </div>
  );
}
