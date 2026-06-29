import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  pathSegments: string[];
  isMobile?: boolean;
}

export function Breadcrumbs({ pathSegments, isMobile = false }: BreadcrumbsProps) {
  if (pathSegments.length <= 1) return null;

  if (isMobile) {
    return (
      <div className="flex items-center text-[11px] font-medium text-muted-foreground">
        <span>Home</span>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          if (!isLast && index > 0) return null; // Hide middle segments on mobile
          return (
            <div key={segment} className="flex items-center">
              <ChevronRight className="w-3 h-3 mx-0.5" />
              <span className={isLast ? "text-foreground line-clamp-1 max-w-[80px]" : "line-clamp-1 max-w-[60px]"}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center text-[13px] font-medium text-muted-foreground mb-1.5 overflow-hidden">
      <Link href="/projects" className="hover:text-foreground transition-colors">Home</Link>
      {pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        
        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            {isLast ? (
              <span className="text-foreground">{title}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors line-clamp-1 max-w-[120px]" title={title}>
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
