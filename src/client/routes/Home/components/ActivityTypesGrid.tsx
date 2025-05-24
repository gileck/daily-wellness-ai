import React from 'react';
import { Box, Typography } from '@mui/material';
import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityIcon } from './ActivityIcon';
import { getActivityColor } from '../utils/colorUtils';

interface ActivityTypesGridProps {
    activityTypes: ActivityTypeClient[];
    onActivityClick: (activityType: ActivityTypeClient) => void;
}

export const ActivityTypesGrid: React.FC<ActivityTypesGridProps> = ({
    activityTypes,
    onActivityClick
}) => {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 3,
            maxWidth: '400px',
            margin: '0 auto',
            justifyItems: 'center'
        }}>
            {activityTypes.map((activity: ActivityTypeClient) => (
                <Box
                    key={activity._id}
                    onClick={() => onActivityClick(activity)}
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'transform 0.1s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.05)'
                        },
                        '&:active': {
                            transform: 'scale(0.95)'
                        }
                    }}
                >
                    {/* iOS App Icon */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '18px', // iOS app icon border radius
                            backgroundColor: getActivityColor(activity),
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                                borderRadius: '18px'
                            }
                        }}
                    >
                        <ActivityIcon activityType={activity} />
                    </Box>

                    {/* App Name */}
                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#1A1A1A',
                            textAlign: 'center',
                            maxWidth: '80px',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {activity.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}; 