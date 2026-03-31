import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from './ui/use-mobile';
import { AdminMobileGate } from './AdminMobileGate';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin } = useAuth();
    const isMobile = useIsMobile();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    if (isMobile) {
        return <AdminMobileGate />;
    }

    return <>{children}</>;
}
