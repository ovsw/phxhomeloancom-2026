import {
  DynamicIcon,
  dynamicIconImports,
  type IconName,
} from "lucide-react/dynamic.mjs";
import { cn } from "@/lib/utils";
import { isLoanIconName } from "../../../shared/loan-icons";
import { LoanIcon } from "../icons/loan-icon";
import { lucideIconAliases } from "./lucide-icon-aliases";

const iconAliasSet = new Set<string>(lucideIconAliases);

export function NavigationIcon({ className, name }: { className?: string; name: string }) {
  if (isLoanIconName(name)) {
    return <LoanIcon className={cn("size-4", className)} name={name} />;
  }
  if (!(name in dynamicIconImports) || iconAliasSet.has(name)) return null;

  return (
    <DynamicIcon
      aria-hidden="true"
      className={cn("size-4", className)}
      name={name as IconName}
    />
  );
}
