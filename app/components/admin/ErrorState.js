"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function ErrorState({ message }) {
  const t = useTranslations("adminCommon");
  const errorText = message || t("errorGeneric");
  return (
    <div className="py-8 text-center text-(--ui-danger)">
      <p>{errorText}</p>
    </div>
  );
}
