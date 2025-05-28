import React, { useState } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import { ActivitiesTab } from './components/ActivitiesTab';
import { MetricsTab } from './components/MetricsTab';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const ConfigureActivities = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 0, px: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="configuration tabs">
                    <Tab label="Activities" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                    <Tab label="Metrics" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <ActivitiesTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <MetricsTab />
            </TabPanel>
        </Container>
    );
};

export default ConfigureActivities; 