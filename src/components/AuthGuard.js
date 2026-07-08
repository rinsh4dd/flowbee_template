"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";
import FlowbeeLoader from "@/components/FlowbeeLoader";


/**
 * Protects pages requiring any authenticated user.
 * Redirects to /login if unauthenticated.
 */
export function ProtectedRoute(Component) {
  return function ProtectedElement(props) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
        if (!currentUser) {
          router.push("/login");
        } else if (currentUser.role === "admin") {
          router.push("/admin/templates");
        } else {
          setUser(currentUser);
          setChecking(false);
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (checking) {
      return <FlowbeeLoader />;
    }

    return <Component {...props} user={user} />;
  };
}

/**
 * Protects pages requiring a user with the 'admin' role.
 * Redirects to /login if unauthenticated, or to /dashboard if role is not admin.
 */
export function AdminRoute(Component) {
  return function AdminElement(props) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
        if (!currentUser) {
          router.push("/login");
        } else if (currentUser.role !== "admin") {
          console.warn("Unauthorized access: admin role required");
          router.push("/dashboard");
        } else {
          setUser(currentUser);
          setChecking(false);
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (checking) {
      return <FlowbeeLoader />;
    }

    return <Component {...props} user={user} />;
  };
}

/**
 * Prevents authenticated users from viewing login/register pages.
 * Redirects to /dashboard if already logged in.
 */
export function PublicOnlyRoute(Component) {
  return function PublicOnlyElement(props) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const unsubscribe = authService.subscribeToAuthChanges((currentUser) => {
        if (currentUser) {
          if (currentUser.role === "admin") {
            router.push("/admin/templates");
          } else {
            router.push("/dashboard");
          }
        } else {
          setChecking(false);
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (checking) {
      return <FlowbeeLoader />;
    }

    return <Component {...props} />;
  };
}
