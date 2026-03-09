import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import DashboardLayout from '../components/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';
import Timetable from './Timetable';
import Courses from './Courses';
import Rooms from './Rooms';
import FacultyCourses from './FacultyCourses';
import Settings from './Settings';

const Section = ({ id, children }) => (
    <section id={id} className="min-h-screen py-20 border-b border-ocean-500/10 outline-none w-full relative" tabIndex="-1">
        {children}
    </section>
);

export default function MainScrollApp() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col w-full">
                <Section id="dashboard-overview">
                    {user.role === 'ADMIN' && <AdminDashboard />}
                    {user.role === 'FACULTY' && <FacultyDashboard />}
                    {user.role === 'STUDENT' && <StudentDashboard />}
                </Section>

                <Section id="timetable">
                    <Timetable />
                </Section>

                {user.role === 'FACULTY' && (
                    <Section id="my-courses">
                        <FacultyCourses />
                    </Section>
                )}

                {user.role === 'ADMIN' && (
                    <>
                        <Section id="courses">
                            <Courses />
                        </Section>
                        <Section id="rooms">
                            <Rooms />
                        </Section>
                        <Section id="settings">
                            <Settings />
                        </Section>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
