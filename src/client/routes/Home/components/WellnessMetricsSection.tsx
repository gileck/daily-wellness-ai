import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { WellnessMetricClient } from '@/apis/wellnessMetrics/types';
import { colors } from '../utils/colorUtils';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';

interface WellnessMetricsSectionProps {
    wellnessMetrics: WellnessMetricClient[];
    onMetricClick: (metric: WellnessMetricClient) => void;
}

export const WellnessMetricsSection: React.FC<WellnessMetricsSectionProps> = ({
    wellnessMetrics,
    onMetricClick,
}) => {
    const enabledMetrics = wellnessMetrics.filter(metric => metric.enabled);

    if (enabledMetrics.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: '#1A1A1A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <TrendingUpIcon sx={{ color: colors.primary }} />
                Wellness Metrics
            </Typography>

            <Grid container spacing={2}>
                {enabledMetrics.map((metric) => {
                    const metricColor = metric.color || colors.primary;
                    const metricIcon = metric.icon ? getActivityIconWithProps(metric.icon, { sx: { color: 'white', fontSize: 24 } }) : <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />;

                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={metric._id}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: '#F8F9FA',
                                    border: '1px solid #E9ECEF',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: '#E3F2FD',
                                        borderColor: metricColor,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${metricColor}25`,
                                    },
                                }}
                                onClick={() => onMetricClick(metric)}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            backgroundColor: metricColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 1,
                                        }}
                                    >
                                        {metricIcon}
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1A1A1A',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {metric.name}
                                    </Typography>

                                    <Button
                                        variant="text"
                                        size="small"
                                        sx={{
                                            textTransform: 'none',
                                            color: metricColor,
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                            },
                                        }}
                                    >
                                        Track Now
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}; 