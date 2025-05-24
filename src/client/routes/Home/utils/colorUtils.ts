import { ActivityTypeClient } from '@/apis/activity/types';

// iOS-inspired color palette
export const colors = {
    primary: '#007AFF',
    secondary: '#FF2D55',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
    background: '#F2F2F7',
    surface: '#FFFFFF',
};

// Helper to get activity color - use saved color or fallback to generated color
export const getActivityColor = (activity: ActivityTypeClient): string => {
    // Use saved color if available
    if (activity.color) {
        return activity.color;
    }

    // Fallback to iOS-inspired colors with variety
    const baseColors = [
        colors.primary,    // iOS blue
        '#5856D6',         // iOS purple
        colors.secondary,  // iOS pink
        '#4CD964',         // iOS green
        '#FFCC00',         // iOS yellow
        colors.info,       // iOS light blue
        '#FF9500'          // iOS orange
    ];

    let hash = 0;
    const activityName = activity.name + activity.type;
    for (let i = 0; i < activityName.length; i++) {
        hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to select one of our predefined iOS colors
    const index = Math.abs(hash) % baseColors.length;
    return baseColors[index];
}; 