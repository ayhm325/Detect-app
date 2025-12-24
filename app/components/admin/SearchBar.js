import Input from "@/app/components/ui/Input";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function SearchBar({ value, onChange, placeholder }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const searchPlaceholder = placeholder || tr.filters?.searchPlaceholder || (locale === "ar" ? "بحث..." : "Search...");
  return (
    <div className="my-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={searchPlaceholder}
      />
    </div>
  );
}
