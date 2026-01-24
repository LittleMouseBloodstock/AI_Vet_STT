'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DemoInit() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const demo = searchParams.get('demo');
        if (demo === 'true') {
            sessionStorage.setItem('demo', 'true');
            // Force reload to apply demo mode if it was just set
            if (!sessionStorage.getItem('demo_initialized')) {
                sessionStorage.setItem('demo_initialized', 'true');
                window.location.reload();
            }
        }
    }, [searchParams]);

    return null;
}
