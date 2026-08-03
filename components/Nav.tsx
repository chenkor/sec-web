"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSecData } from "@/components/SecDataProvider";
import { NAV } from "@/lib/site";

type Indicator = { left: number; width: number; ready: boolean };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({
  pathname,
  className,
  ariaLabel,
}: {
  pathname: string;
  className: string;
  ariaLabel: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator>({
    left: 0,
    width: 0,
    ready: false,
  });

  const measure = useCallback(() => {
    const nav = navRef.current;
    const activeHref =
      NAV.find((item) => isActive(pathname, item.href))?.href ?? "/";
    const el = linkRefs.current.get(activeHref);
    if (!nav || !el) return;

    // offset* stays relative to the nav, so viewport/scrollbar changes don't jump it.
    const padX = 11;
    setIndicator({
      left: el.offsetLeft + padX,
      width: Math.max(12, el.offsetWidth - padX * 2),
      ready: true,
    });
  }, [pathname]);

  useLayoutEffect(() => {
    measure();
    // Remeasure after paint in case fonts/layout settle one frame later.
    const id = window.requestAnimationFrame(() => measure());
    return () => window.cancelAnimationFrame(id);
  }, [measure]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const fontsReady = "fonts" in document ? document.fonts.ready : null;
    void fontsReady?.then(measure);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [measure]);

  return (
    <nav ref={navRef} className={className} aria-label={ariaLabel}>
      <span
        className="site-nav__indicator"
        aria-hidden
        data-ready={indicator.ready}
        style={{
          transform: `translate3d(${indicator.left}px, 0, 0)`,
          width: `${indicator.width}px`,
        }}
      />
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="site-nav__link"
            data-active={active}
            ref={(node) => {
              if (node) linkRefs.current.set(item.href, node);
              else linkRefs.current.delete(item.href);
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { apkUrl } = useSecData();

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__brand">
          SEC
        </Link>

        <NavLinks
          pathname={pathname}
          className="site-nav__links"
          ariaLabel="Primary"
        />

        <a href={apkUrl} className="btn btn-primary">
          Download APK
        </a>
      </div>

      <NavLinks
        pathname={pathname}
        className="site-nav__mobile"
        ariaLabel="Mobile"
      />
    </header>
  );
}
