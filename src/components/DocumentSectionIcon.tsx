import {
  Archive,
  FileCheck2,
  Files,
  Scale,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import type { DocumentIconId } from "@/lib/predioDocumentSections";

const icons = {
  scale: Scale,
  files: Files,
  succession: UsersRound,
  possession: FileCheck2,
  charges: ShieldAlert,
  archive: Archive,
};

export function DocumentSectionIcon({
  icon,
  size = 15,
  className,
}: {
  icon: DocumentIconId;
  size?: number;
  className?: string;
}) {
  const Icon = icons[icon];
  return <Icon size={size} className={className} />;
}
