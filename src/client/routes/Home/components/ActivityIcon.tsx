import React from 'react';
import { Typography } from '@mui/material';
import { ActivityTypeClient } from '@/apis/activity/types';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';

interface ActivityIconProps {
    activityType: ActivityTypeClient;
    size?: 'small' | 'large';
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ activityType, size = 'large' }) => {
    const isSmall = size === 'small';
    const iconSize = isSmall ? 16 : 28;
    const fontSize = isSmall ? '12px' : '18px';

    const iconElement = getActivityIconWithProps(activityType.icon, {
        sx: { fontSize: iconSize, color: 'white' }
    });

    if (iconElement) {
        return iconElement;
    }

    // Fallback to text initials
    return (
        <Typography
            sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: fontSize,
                textAlign: 'center',
                textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
                zIndex: 1,
                lineHeight: 1.1
            }}
        >
            {activityType.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
        </Typography>
    );
}; 