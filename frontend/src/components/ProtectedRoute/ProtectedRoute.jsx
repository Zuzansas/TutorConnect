import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {

    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');

    const isAuthorized = token && role === 'ADMIN';

    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;