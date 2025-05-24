import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import { TrackedActivity } from '@/apis/trackedActivities/types';
import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityIcon } from './ActivityIcon';
import { colors, getActivityColor } from '../utils/colorUtils';
import { formatRelativeTime } from '../utils/timeUtils';
import { formatFieldValue } from '@/client/utils/foodDisplayUtils';

interface RecentActivitiesSectionProps {
    recentlyLoggedActivities: TrackedActivity[];
    activityTypes: ActivityTypeClient[];
}

export const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({
    recentlyLoggedActivities,
    activityTypes
}) => {
    if (recentlyLoggedActivities.length === 0) {
        return null;
    }

    // Helper to find activity type by ID
    const getActivityType = (activityTypeId: string): ActivityTypeClient | null => {
        return activityTypes.find(type => type._id === activityTypeId) || null;
    };

    return (
        <>
            <Divider sx={{ my: 4 }} />

            <Typography
                variant="h5"
                sx={{
                    fontWeight: 600,
                    fontSize: '22px',
                    color: '#1A1A1A',
                    mb: 2
                }}
            >
                Recently Tracked Activities
            </Typography>

            <Box sx={{ mt: 2 }}>
                {recentlyLoggedActivities.map((activity, index) => {
                    const activityType = getActivityType(activity.activityTypeId);

                    return (
                        <Card
                            key={activity._id || index}
                            sx={{
                                mb: 2,
                                borderRadius: '10px',
                                boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                overflow: 'visible'
                            }}
                        >
                            <CardContent sx={{ py: 2, px: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 1
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: activityType ? getActivityColor(activityType) : colors.primary,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                mr: 2,
                                                flexShrink: 0
                                            }}
                                        >
                                            {activityType ? (
                                                <ActivityIcon activityType={activityType} size="small" />
                                            ) : (
                                                activity.activityName.substring(0, 2).toUpperCase()
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                {activity.activityName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={formatRelativeTime(new Date(activity.timestamp))}
                                        sx={{
                                            borderRadius: '16px',
                                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                            color: colors.primary,
                                            fontWeight: 500,
                                            fontSize: '11px',
                                            flexShrink: 0,
                                            ml: 1
                                        }}
                                    />
                                </Box>

                                {/* Tracked Fields Chips */}
                                {activity.values.length > 0 && (
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.5,
                                        mt: 1,
                                        ml: '56px' // Align with the text content
                                    }}>
                                        {activity.values.slice(0, 4).map((fieldValue, fieldIndex) => {
                                            const formattedValue = formatFieldValue(fieldValue.fieldName, fieldValue.value);

                                            // If it's a React node (food chips), render directly
                                            if (React.isValidElement(formattedValue)) {
                                                return (
                                                    <Box key={fieldIndex} sx={{ display: 'contents' }}>
                                                        <Typography variant="caption" sx={{ fontSize: '10px', mr: 0.5 }}>
                                                            {fieldValue.fieldName}:
                                                        </Typography>
                                                        {formattedValue}
                                                    </Box>
                                                );
                                            }

                                            // Otherwise render as chip
                                            return (
                                                <Chip
                                                    key={fieldIndex}
                                                    label={formattedValue}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: '10px',
                                                        height: '18px',
                                                        '& .MuiChip-label': {
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            );
                                        })}
                                        {activity.values.length > 4 && (
                                            <Chip
                                                label={`+${activity.values.length - 4} more`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: '10px',
                                                    height: '18px',
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </>
    );
}; 