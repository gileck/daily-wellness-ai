import React from 'react';
import ActivityConfigurationDashboard from './ActivityConfigurationDashboard';

// Temporarily removed PageLayout due to import issues
// import { PageLayout } from '../../components/Layout/PageLayout';

const ConfigureActivities = () => {
    // TODO: Wrap with a proper PageLayout component if available
    return (
        // <PageLayout title="Configure Activities & Metrics">
        <ActivityConfigurationDashboard />
        // </PageLayout>
    );
};

export default ConfigureActivities; 