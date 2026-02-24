import { Badge } from "@/components/ui/badge";
import { IvaCategory } from "@/generated/prisma/enums";
import { IVA_LABELS, IVA_COLORS } from "@/types/tax";

interface IvaBadgeProps {
  category: IvaCategory;
}

export function IvaBadge({ category }: IvaBadgeProps) {
  return (
    <Badge variant="outline" className={IVA_COLORS[category]}>
      {IVA_LABELS[category]}
    </Badge>
  );
}
