'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    to?: string | { pathname?: string; search?: string; hash?: string };
    href?: string;
    replace?: boolean;
    scroll?: boolean;
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    target?: string;
    rel?: string;
    title?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ to, href, children, ...props }, ref) => {
    let finalHref = href || '/';
    if (to) {
        if (typeof to === 'string') {
            finalHref = to;
        } else {
            finalHref = `${to.pathname || ''}${to.search || ''}${to.hash || ''}` || '/';
        }
    }
    return (
        <NextLink ref={ref} href={finalHref} {...props}>
            {children}
        </NextLink>
    );
});

Link.displayName = 'Link';

export function useNavigate() {
    const router = useNextRouter();
    return useCallback((to: string | number, options?: { replace?: boolean }) => {
        if (typeof to === 'number') {
            if (to === -1 && typeof window !== 'undefined') {
                window.history.back();
            } else if (to === 1 && typeof window !== 'undefined') {
                window.history.forward();
            }
            return;
        }
        if (options?.replace) {
            router.replace(to);
        } else {
            router.push(to);
        }
    }, [router]);
}

export function useLocation() {
    let pathname = '/';
    try {
        pathname = usePathname() || '/';
    } catch {
        if (typeof window !== 'undefined') pathname = window.location.pathname;
    }

    let search = '';
    try {
        const searchParams = useNextSearchParams();
        search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    } catch {
        if (typeof window !== 'undefined') search = window.location.search;
    }

    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    return {
        pathname,
        search,
        hash,
        state: null,
        key: 'default'
    };
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
    try {
        const params = useNextParams();
        return (params || {}) as T;
    } catch {
        return {} as T;
    }
}

export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void] {
    let nextSearchParams: any = null;
    try {
        nextSearchParams = useNextSearchParams();
    } catch {
        // Fallback for SSR prerender without suspense
    }

    const router = useNextRouter();
    let pathname = '/';
    try {
        pathname = usePathname() || '/';
    } catch {
        if (typeof window !== 'undefined') pathname = window.location.pathname;
    }

    const current = useMemo(() => {
        if (nextSearchParams) {
            return new URLSearchParams(nextSearchParams.toString());
        }
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search);
        }
        return new URLSearchParams('');
    }, [nextSearchParams]);

    const setSearchParams = useCallback((newParams: URLSearchParams | Record<string, string>) => {
        const p = new URLSearchParams(newParams as any);
        const query = p.toString();
        router.push(`${pathname}${query ? `?${query}` : ''}`);
    }, [pathname, router]);

    return [current, setSearchParams];
}

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
    const router = useNextRouter();
    useEffect(() => {
        if (replace) {
            router.replace(to);
        } else {
            router.push(to);
        }
    }, [to, replace, router]);
    return null;
};

export function Outlet() {
    return null;
}
