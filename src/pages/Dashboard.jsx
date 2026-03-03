import { useAuthStore } from '../store/useAuthStore';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
    const { user } = useAuthStore();

    if (!user) return null;

    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'FACULTY':
            return <FacultyDashboard />;
        case 'STUDENT':
            return <StudentDashboard />;
        default:
            return <div>Invalid Role</div>;
    }
}
