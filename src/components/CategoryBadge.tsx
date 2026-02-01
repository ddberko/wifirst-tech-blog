import Link from "next/link";

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <Link
      href={`/category?name=${encodeURIComponent(category)}`}
      className="inline-block bg-[#0066CC]/8 text-[#0066CC] text-xs font-semibold px-3 py-1 rounded-full hover:bg-[#0066CC]/15 transition-colors"
    >
      {category}
    </Link>
  );
}
